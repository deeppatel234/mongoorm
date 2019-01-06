const _ = require('lodash');

const AbstractFields = require('./AbstractFields');

class ObjectField extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'object';
    this.fieldName = '';
    Object.assign(this, this.prepareElements(props.ele));
    this.elementsKeys = Object.keys(props.ele);
    delete this.props.ele;
  }

  /**
   * prepare fields
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  prepareElements(fields) {
    const objFields = {};
    Object.keys(fields).forEach(function (key) {
      let ClassName = fields[key].fieldClass;
      objFields[key] = new ClassName(fields[key].props);
    });
    return objFields;
  }

  /**
   * extract data from all the fields and store in data param
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  getData({ mode = 'all' } = {}) {
    let keys = this.elementsKeys;
    let func = this.getGetterFunction(mode);
    let data = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (this[key].type === 'object') {
        let value = this[key].getData({ mode });
        if (!_.isEmpty(value)) {
          data[key] = value;
        }
      } else {
        let value = this[key].get();
        if (func(this[key])) {
          data[key] = value;
        }
      }
    }
    return data;
  }

  /**
   * return field information
   * like string, field name , field type etc.
   */
  getFieldInfo() {
    const self = this;
    const info = super.getFieldInfo();
    info.ele = {};
    this.elementsKeys.forEach(function (key) {
      info.ele[key] = self[key].getFieldInfo();
    });
    return info;
  }

  /**
   * getter function is used in get data function
   * if function returns true them fields data is returned else ignore
   *
   * @param {any} mode
   * @memberof ObjectField
   */
  getGetterFunction(mode) {
    let func = field => !field.isUndefined();
    if (mode === 'modified') {
      func = field => field.isModified;
    }
    return func;
  }

  /**
   * scan all elements and return props
   * param type is string return props value
   *  EX: { a: propValue }
   * param type is list return props value with key
   *  EX: { a.propname : propValue }
   * @param {any} mode
   * @memberof ObjectField
   */
  getGlobleProps(props) {
    const self = this;
    let data = {};
    this.elementsKeys.forEach(function (key) {
      let p = self[key].type === 'object' ? self[key].getGlobleProps(props) : self[key].getProps(props);
      if (!_.isUndefined(p) && !(_.isPlainObject(p) && _.isEmpty(p))) {
        data[key] = p;
      }
    });
    return data;
  }

  /**
   * required props in field
   *
   * @memberof ObjectField
   */
  getRequiredProps() {
    return ['ele'];
  }

  /**
   * set values to all related fields
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  set(value) {
    const self = this;
    this.elementsKeys.forEach(function (key) {
      if (!_.isUndefined(value[key])) {
        self[key].set(value[key]);
      }
    });
    super.set(value);
  }

  /**
   * set fieldName to all obect elements
   *
   * @memberof ObjectField
   */
  setFieldName(name) {
    super.setFieldName(name);
    const self = this;
    this.elementsKeys.forEach(function (key) {
      self[key].setFieldName(key);
    });
  }

  /**
   * mark all obect elements to false
   *
   * @memberof ObjectField
   */
  markModified() {
    const self = this;
    this.elementsKeys.forEach(function (key) {
      self[key].markModified(false);
    });
  }

  /**
   * return object data
   * @memberof ObjectField
   */
  get() {
    return this.getData();
  }

  /**
   * return modified data
   * @memberof ObjectField
   */
  getModifiedData() {
    return this.getData({ mode: 'modified' });
  }

  /**
   * @param {string|object} msg
   * @param {string} prop
   */
  getErrorMessage(msg, prop) {
    if (_.isObject(msg)) {
      let { message } = msg;
      msg = message;
    }
    return (`{KEY} :: ${msg}` || `{KEY} :: ${prop} is not valid`).replace('{KEY}', this.fieldName);
  }

  /**
   * validate object elements
   * @memberof ObjectField
   */
  validate() {
    let self = this;
    return super.validate().then(function () {
      let defs = self.elementsKeys.map(function (key) {
        return new Promise((res, rej) => {
          self[key].validate()
            .then(() => res())
            .catch(err => rej(err));
        });
      });
      return new Promise((res, rej) => {
        Promise.all(defs).then(() => res()).catch(err => rej(self.getErrorMessage(err)));
      });
    });
  }

  /**
   * validate modified object elements
   * @memberof ObjectField
   */
  validateModified() {
    let self = this;
    return super.validate().then(function () {
      let defs = [];
      self.elementsKeys.forEach(function (key) {
        if (self[key].isModified) {
          defs.push(new Promise((res, rej) => {
            self[key].validate()
              .then(() => res())
              .catch(err => rej(err));
          }));
        }
      });
      return new Promise((res, rej) => {
        Promise.all(defs).then(() => res()).catch(err => rej(self.getErrorMessage(err)));
      });
    });
  }

  /**
   * validate object type
   * @memberof ObjectField
   */
  validateType(value) {
    return _.isPlainObject(value);
  }
}

module.exports = ObjectField;
