const _ = require('lodash');
const logger = require('../base/Logger');
const mongoutils = require('../base/MongoUtils');

class Record {
  constructor(document, data, options) {
    this._record = {
      document,
      options,
    };
    this.ele = _.cloneDeep(document.fields);
    this.ele.initValue(data);
    Object.assign(this, document.customFunctions);

    return new Proxy(this, {
      get(target, name) {
        if (target.ele.elementsKeys.indexOf(name) !== -1) {
          return target.ele[name];
        }
        return target[name];
      },
    });
  }
  /**
   * extract data from all the fields
   * mode: modified return only modified data
   * @param {string} mode
   * @memberof Record
   */
  _getFieldsValue(mode, id = true, timestamp = true) {
    let data = {};
    if (mode === 'modified') {
      data = this.ele.getModifiedData();
    } else {
      data = this.ele.get();
    }
    let omitedFields = [];
    if (!id) {
      omitedFields.push('_id');
    }
    if (!timestamp) {
      omitedFields.push(...Object.values(this._record.document.timestamps || {}));
    }
    return _.omit(data, omitedFields);
  }
  /**
   * add timestamps before update/save
   * @param {any} data
   * @param {any} mode
   * @returns data
   * @memberof Record
   */
  _getTimestamp(mode) {
    const ts = this._record.document.timestamps;
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
      return this._record.document.updateOne({ _id: this.getId() }, { $set: data }).then((err) => {
        if (!err) {
          self._triggerSaved(data);
        }
      });
    }
    return mongoutils.asyncError(validate.errorMessage);
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
    let ts = this._record.document.timestamps;
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
    this.ele.markModified();
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
    return this._record.document.deleteOne({ _id: this.getId() });
  }
  /**
   * return record id
   * @memberof Record
   */
  getId() {
    return this.ele._id.get();
  }
  /**
   * save Single Record in Database
   * @returns promises
   * @memberof Record
   */
  save() {
    if (this.getId()) {
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
    let isValid = this.ele.validate();
    if (isValid) {
      return { isValid };
    }
    return { isValid: false, errorMessage: this.ele.getErrorMessage('') };
  }

  /**
   * return data in json format
   * @param {boolean} id
   * @param {boolean} timestamps
   * @returns obj
   * @memberof Record
   */
  toJson() {
    return this._getFieldsValue();
  }
}

module.exports = Record;
