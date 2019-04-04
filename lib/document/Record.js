const _isEmpty = require('lodash/isEmpty');
const _omit = require('lodash/omit');

const { obj2dot } = require('../base/MongoUtils');

class Record {
  constructor(document, data = {}) {
    this.document = document;
    this.schema = document.schema;

    Object.assign(this, document.customMethods);

    this.ele = this.schema.initRecord();
    this.ele.set(data);

    return new Proxy(this, {
      get(target, name) {
        if (target.ele.elementsKeys.includes(name)) {
          return target.ele[name];
        }
        return target[name];
      },
    });
  }

  /**
   * =====================
   *    Public Methods
   * =====================
   */

  /**
   * delete record in Database
   *
   * @returns promises
   * @memberof Record
   */
  delete() {
    if (this.getId()) {
      return this.document.wrapHooks('delete', this, () => this.document.deleteOne({ _id: this.getId() }));
    }
    return Promise.reject(new Error('Id not defined'));
  }

  /**
   * return data in json format
   *
   * @returns obj
   * @memberof Record
   */
  get() {
    return this.ele.get();
  }

  /**
   * return record id
   * @memberof Record
   */
  getId() {
    return this.ele._id.get();
  }

  /**
   * set record data
   * @memberof Record
   */
  set(data) {
    return this.ele.set(data);
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
    return this.document.wrapHooks('save', this, () => (this.getId() ? this._update() : this._save()));
  }

  /**
   * validate data
   * @returns boolean
   * @memberof Record
   */
  validate() {
    if (this.schema.options.validateBefourSave) {
      return this.ele.validate();
    }
    return Promise.resolve();
  }

  /**
   * validate modified data
   * @returns boolean
   * @memberof Record
   */
  validateModified() {
    if (this.schema.options.validateBefourSave) {
      return this.ele.validateModified();
    }
    return Promise.resolve();
  }


  /**
   * =====================
   *    Private Methods
   * =====================
   */

  _prepareRecord(mode) {
    const validator = mode === 'save' ? this.validate : this.validateModified;
    return validator.call(this).then(() => {
      const data = _omit(mode === 'save' ? this.ele.get() : this.ele.getModifiedData(), ['_id']);
      if (_isEmpty(data)) {
        return Promise.resolve();
      }
      Object.assign(data, this.schema.getTimestamp(mode));
      return data;
    });
  }

  _save() {
    return this._prepareRecord('save').then(data => (
      new Promise((resolve, reject) => {
        this.document.insertOne(data).then((result) => {
          this._triggerSaved(data);
          this.setId(result.insertedId);
          resolve(result);
        }).catch(reject);
      })
    ));
  }

  _update() {
    return this._prepareRecord('update').then((data) => {
      if (_isEmpty(data)) {
        return Promise.resolve();
      }
      return this.document.updateOne({ _id: this.getId() }, { $set: obj2dot(data) }).then((err) => {
        if (!err) {
          this._triggerSaved(data);
          return data;
        }
      });
    });
  }

  _triggerSaved(data) {
    this.ele.markModified();

    const ts = this.schema.getTimestampFields();
    if (ts) {
      if (data[ts.createAt]) {
        this.ele[ts.createAt].set(data[ts.createAt]);
      }
      if (data[ts.writeAt]) {
        this.ele[ts.writeAt].set(data[ts.writeAt]);
      }
    }
  }
}

module.exports = Record;
