const _ = require('lodash');
const mongodb = require('mongodb');

const AbstractFields = require('./AbstractFields');
const ArrayFields = require('./ArrayFields');

class One extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'one';

    return new Proxy(this, {
      get(target, name) {
        if (target.getRecord().ele.elementsKeys.indexOf(name) !== -1) {
          return target.record[name];
        }
        return target[name];
      },
    });
  }
  /* ========================
      Override Functions
    ======================== */
  /**
   * save record before save parent document
   *
   * @memberof One
   */
  beforeSave() {
    let value = this.get({ populate: true });
    if (!this.props.required && _.isEmpty(value)) {
      return Promise.resolve();
    }
    return this.getRecord().save();
  }
  /**
   * get field data
   *
   * @memberof One
   */
  get({ populate } = {}) {
    if (Array.isArray(populate)) {
      populate = populate.indexOf(this.fieldName) !== -1;
    }
    return populate ? this.getRecord().toJson() : this.getRecord()._id.getString();
  }
  /**
   * return field information
   * like string, field name , field type etc.
   */
  getFieldInfo() {
    const info = super.getFieldInfo();
    info.model = this.props.doc.documentName;
    return info;
  }
  /**
   * check field props
   *
   * @memberof One
   */
  getRequiredProps() {
    return ['doc'];
  }
  /**
   * set field value
   *
   * @memberof One
   */
  set(value) {
    if (!_.isEmpty(value)) {
      mongodb.ObjectID.isValid(value) || _.isString(value)
        ? this.getRecord().setId(value) : this.getRecord().ele.set(value);
      this.isModified = true;
    }
  }
  /**
   * validate field value
   *
   * @memberof One
   */
  validate() {
    const self = this;
    return super.validate().then(function () {
      let value = self.get({ populate: true });
      if (!self.props.required && _.isEmpty(value)) {
        return Promise.resolve();
      }
      return self.getRecord().validate();
    });
  }
  /**
   * validate field is required
   *
   * @memberof One
   */
  validateRequired(propValue) {
    if (propValue) {
      let value = this.get({ populate: true });
      if (_.isEmpty(value)) {
        return false;
      }
    }
    return true;
  }
  /**
   * check field value
   *
   * @memberof One
   */
  isUndefined() {
    return false;
  }
  /**
   * check field value type
   *
   * @memberof One
   */
  validateType() {
    return true;
  }
  /* ========================
      One Field Functions
    ======================== */
  /**
   * fetch record from db
   *
   * @memberof One
   */
  fetchData() {
    if (this.getRecord()._id.get()) {
      return this.getRecord().fetchData();
    }
    return Promise.resolve();
  }
  /**
   * get record
   *
   * @memberof One
   */
  getRecord() {
    if (!this.record) {
      this.record = this.props.doc.createRecord();
    }
    return this.record;
  }
}

class Many extends ArrayFields {
  constructor(props) {
    super(props);
    this.type = 'many';
  }

  beforeInit(props) {
    this.ele = new One({ doc: props.doc });
  }

  getRequiredProps() {
    return ['doc'];
  }

  fetchData() {
    let defs = [];
    for (let i = 0; i < this._value.length; i += 1) {
      defs.push(this._value[i].fetchData());
    }
    return Promise.all(defs);
  }
}

module.exports = {
  One,
  Many,
};
