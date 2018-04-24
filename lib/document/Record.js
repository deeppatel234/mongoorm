const _ = require('lodash');
const logger = require('../base/logger').getLogger();
const mongoutils = require('../base/mongoutils');
const MongoError = require('../base/Error');

class Record {
  constructor(document, data, options) {
    this._record = {
      document,
      options,
      fields: _.cloneDeep(document.fields),
    };
    this._initFieldsValue(this._record.fields, data);
    Object.assign(this, this._record.fields);
    Object.assign(this, document.customFunctions);
  }

  /**
   * extract data from all the fields and store in data param
   * @param {object} fields
   * @param {object} data
   * @memberof Record
   */
  _getData(fields, data, func) {
    let keys = Object.keys(fields);
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (fields[key].isFieldObject) {
        let value = fields[key].get();
        if (func(value, fields[key])) {
          data[key] = value;
        }
      } else {
        if (_.isUndefined(data[key])) {
          data[key] = {};
        }
        this._getData(fields[key], data[key], func);
        if (_.isEmpty(data[key])) {
          delete data[key];
        }
      }
    }
  }
  /**
   * filter fields from current object
   * @memberof Record
   */
  _getFields(id = true, timestamp = true) {
    let omittedKeys = ['_record'];
    if (!id) {
      omittedKeys.push('_id');
    }
    if (!timestamp) {
      omittedKeys.push(...Object.values(this._record.document.timestampFields));
    }
    return _.pickBy(_.omit(this, omittedKeys), val => !_.isFunction(val));
  }
  /**
   * extract data from all the fields
   * mode: modified return only modified data
   * @param {string} mode
   * @memberof Record
   */
  _getFieldsValue(mode, id = true, timestamp = true) {
    let data = {};
    this._getData(this._getFields(id, timestamp), data, this._getGetterFunction(mode));
    return data;
  }
  /**
   * getter function is used in get data function
   * if function returns true them fields data is returned else ignore
   *
   * @param {any} mode
   * @memberof Record
   */
  _getGetterFunction(mode) {
    let func = () => true;
    if (mode === 'all') {
      func = value => !_.isUndefined(value);
    } else if (mode === 'modified') {
      func = (value, field) => !_.isUndefined(value) && field.markModified;
    }
    return func;
  }
  /**
   * return record id
   * @memberof Record
   */
  _getId() {
    return this._id.get();
  }
  /**
   * add timestamps before update/save
   * @param {any} data
   * @param {any} mode
   * @returns data
   * @memberof Record
   */
  _getTimestamp(mode) {
    const ts = this._record.document.timestampFields;
    let data = {};
    if (ts) {
      const time = mongoutils.getCurrentDateTime();
      if (mode === 'save' && ts.createAt) {
        data[ts.createAt] = time;
      }
      if (ts.writeAt) {
        data[ts.writeAt] = time;
      }
    }
    return data;
  }
  /**
   * set values to all related fields
   * @param {object} fields
   * @param {object} data
   * @memberof Record
   */
  _initFieldsValue(fields, data) {
    let keys = Object.keys(fields);
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      let value = data[key];
      if (fields[key].isFieldObject && !_.isUndefined(value)) {
        fields[key].initValue(value);
      } else if (_.isObject(value)) {
        this._initFieldsValue(fields[key], value);
      }
    }
  }
  /**
   * mark and un-mark modified fields when save/update operation
   * @param {any} fields
   * @param {any} value
   * @memberof Record
   */
  _markModified(fields, value) {
    let keys = Object.keys(fields);
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (fields[key].isFieldObject) {
        fields[key].markModified = value;
      } else {
        this._markModified(fields[key], value);
      }
    }
  }
  /**
   * Save Single Record in Database
   * @returns promises
   * @memberof Record
   */
  _saveRecord() {
    const self = this;
    const validate = this.validate();
    if (validate.isValid) {
      let data = self._getFieldsValue('all', false, false);
      if (_.isEmpty(data)) {
        return new Promise(resolve => resolve(true));
      }
      Object.assign(data, self._getTimestamp('save'));
      return new Promise((resolve, reject) => {
        self._record.document.insertOne(data, (err, result) => {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            self._triggerSaved(data);
            self._id.set(result.insertedId);
            resolve(result);
          }
        });
      });
    }
    return mongoutils.asyncError(validate.errorMessage);
  }
  /**
   * update record in Database
   * @returns promises
   * @memberof Record
   */
  _update() {
    const self = this;
    let validate = this.validate();
    if (validate.isValid) {
      let data = this._getFieldsValue('modified', false, false);
      if (_.isEmpty(data)) {
        return new Promise(resolve => resolve(true));
      }
      Object.assign(data, self._getTimestamp());
      data = mongoutils.obj2dot(data);
      return this._record.document.updateOne({ _id: this._getId() }, { $set: data }).then((err) => {
        if (!err) {
          self._triggerSaved(data);
        }
      });
    }
    return mongoutils.asyncError(validate.errorMessage);
  }
  /**
   * Validate User record
   * @param {object|array} record
   * @memberof Document
   */
  validateData(fields) {
    try {
      this._validateSchema(fields);
    } catch (e) {
      return { isValid: false, errorMessage: e.message };
    }
    return { isValid: true };
  }
  /**
   * base function for validate all fields
   * @param {any} fields
   * @memberof Document
   */
  _validateSchema(fields) {
    const self = this;
    Object.keys(fields).forEach((k) => {
      if (fields[k].isFieldObject) {
        if (!fields[k].validate()) {
          throw new MongoError.ValidationError(fields[k].getErrorMessage(k));
        }
      } else {
        self._validateSchema(fields[k]);
      }
    });
  }
  /**
   * reset states of record use in copy record
   * @memberof Record
   */
  _resetStates() {
    this._id.set();
    this._record.saved = false;
  }
  /**
   * update timestamps value after data save/update in database
   * @param {any} data
   * @memberof Record
   */
  _updateTimestamps(data) {
    let ts = this._record.document.timestampFields;
    if (ts) {
      if (data[ts.createAt]) {
        this[ts.createAt].set(data[ts.createAt]);
      }
      if (data[ts.writeAt]) {
        this[ts.writeAt].set(data[ts.writeAt]);
      }
    }
  }
  /**
   * update data if db operation successfully completed
   * @memberof Record
   */
  _triggerSaved(data) {
    this._updateTimestamps(data);
    this._markModified(this._getFields(), false);
  }

  /**
   * copy record without id
   * @returns record
   * @memberof Record
   */
  copy() {
    let copyObject = _.cloneDeep(this);
    copyObject._resetStates();
    return copyObject;
  }
  /**
   * delete record in Database
   * @returns promises
   * @memberof Record
   */
  delete() {
    return this._record.document.deleteOne({ _id: this._getId() });
  }
  /**
   * save Single Record in Database
   * @returns promises
   * @memberof Record
   */
  save() {
    if (this._getId()) {
      return this._update();
    }
    return this._saveRecord();
  }
  /**
   * validate data
   * @returns boolean
   * @memberof Record
   */
  validate() {
    return this.validateData(this._getFields());
  }

  /**
   * return data in json format
   * @param {boolean} id
   * @param {boolean} timestamps
   * @returns obj
   * @memberof Record
   */
  toJson(id, timestamps) {
    return this._getFieldsValue('all', id, timestamps);
  }
}

module.exports = Record;
