const _ = require('lodash');
const logger = require('../base/Logger');
const mongoutils = require('../base/MongoUtils');

class Record {
  constructor(document, data = {}, options = {}) {
    this.document = document;
    this.options = options;
    this.ele = document.fields.clone();
    this.ele.setFieldName();
    this.ele.initValue(data);
    Object.assign(this, document.customFunctions);

    return this.recordProxy();
  }

  recordProxy() {
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
  _getFieldsValue({
    mode = 'all', id = true, timestamp = true, populate = false,
  } = {}) {
    let data = mode === 'modified' ? this.ele.getModifiedData() : this.ele.get({ populate });
    let omitedFields = [];
    if (!id) {
      omitedFields.push('_id');
    }
    if (!timestamp) {
      omitedFields.push(...Object.values(this.document.timestamps || {}));
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
    const ts = this.document.timestamps;
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
    return this.validate().then(() => {
      return self.ele.beforeSave().then(() => {
        let data = self._getFieldsValue({ id: false, timestamp: false });
        if (_.isEmpty(data)) {
          return Promise.resolve();
        }
        Object.assign(data, self._getTimestamp('save'));
        return new Promise((resolve, reject) => {
          self.document.insertOne(data).then((result) => {
            self._triggerSaved(data);
            self.setId(result.insertedId);
            resolve(result);
          }).catch((err) => {
            logger.error(err);
            reject(err);
          });
        });
      });
    });
  }
  /**
   * update record in Database
   * @returns promises
   * @memberof Record
   */
  _update() {
    const self = this;
    return self.validate().then(() => {
      return self.ele.beforeSave().then(() => {
        let data = self._getFieldsValue({ mode: 'modified', id: false, timestamp: false });
        if (_.isEmpty(data)) {
          return Promise.resolve();
        }
        Object.assign(data, self._getTimestamp());
        data = mongoutils.obj2dot(data);
        return self.document.updateOne({ _id: self.getId() }, { $set: data }).then((err) => {
          if (!err) {
            self._triggerSaved(data);
          }
        });
      });
    });
  }
  /**
   * reset states of record use in copy record
   * @memberof Record
   */
  _resetStates() {
    this._id.set();
  }
  /**
   * update timestamps value after data save/update in database
   * @param {any} data
   * @memberof Record
   */
  _updateTimestamps(data) {
    let ts = this.document.timestamps;
    if (ts) {
      if (data[ts.createAt]) {
        this.ele[ts.createAt].set(data[ts.createAt]);
      }
      if (data[ts.writeAt]) {
        this.ele[ts.writeAt].set(data[ts.writeAt]);
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
   * fetch data from id
   * @memberof Record
   */
  fetchData() {
    const self = this;
    const id = this.ele._id.get();
    if (id) {
      return new Error('id not defined');
    }
    return this.document.findById(id, false).then(function (res) {
      if (!_.isEmpty(res)) {
        self.ele.set(res);
      }
    });
  }
  /**
   * delete record in Database
   * @returns promises
   * @memberof Record
   */
  delete() {
    return this.document.wrapHooks('delete', this, () => this.document.deleteOne({ _id: this.getId() }));
  }
  /**
   * return record id
   * @memberof Record
   */
  getId() {
    return this.ele._id.get();
  }
  /**
   * populate record
   * @memberof Record
   */
  populate() {
    return this.ele.populate();
  }
  /**
   * set record id
   * @memberof Record
   */
  setId(id) {
    return this.ele._id.set(id);
  }
  /**
   * save Single Record in Database
   * @returns promises
   * @memberof Record
   */
  save() {
    return this.document.wrapHooks('save', this, () => (this.getId() ? this._update() : this._saveRecord()));
  }
  /**
   * validate data
   * @returns boolean
   * @memberof Record
   */
  validate() {
    if (this.options.validateBefourSave) {
      return this.ele.validate();
    }
    return Promise.resolve();
  }

  /**
   * return data in json format
   * @param {boolean} id
   * @param {boolean} timestamps
   * @returns obj
   * @memberof Record
   */
  toJson({ populate } = {}) {
    return this._getFieldsValue({ populate });
  }
}

module.exports = Record;
