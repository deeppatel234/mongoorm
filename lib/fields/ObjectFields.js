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
   * call all fields beforeSave before record save
   *
   * @memberof ObjectField
   */
  beforeSave() {
    let keys = this.elementsKeys;
    let defs = [];
    for (let i = 0; i < keys.length; i += 1) {
      defs.push(this[keys[i]].beforeSave());
    }
    return Promise.all(defs);
  }
  /**
   * prepare fields
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  prepareElements(fields) {
    let keys = _.keys(fields);
    const objFields = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      let ClassName = fields[key].fieldClass;
      objFields[key] = new ClassName(fields[key].props);
    }
    return objFields;
  }
  /**
   * extract data from all the fields and store in data param
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  getData({ mode = 'all', populate = false }) {
    let keys = this.elementsKeys;
    let func = this.getGetterFunction(mode);
    let data = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (this[key].type === 'object') {
        let value = this[key].getData({ mode, populate });
        if (!_.isEmpty(value)) {
          data[key] = value;
        }
      } else {
        let value = this[key].get({ populate });
        if (func(this[key])) {
          data[key] = value;
        }
      }
    }
    return data;
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
      func = field => !field.isUndefined() && field.isModified;
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
    let keys = this.elementsKeys;
    let data = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      let p = this[key].type === 'object' ? this[key].getGlobleProps(props) : this[key].getProps(props);
      if (!_.isUndefined(p) && !(_.isPlainObject(p) && _.isEmpty(p))) {
        data[key] = p;
      }
    }
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
   * populate relational field data
   *
   * @memberof ObjectField
   */
  populate() {
    let keys = this.elementsKeys;
    let defs = [];
    for (let i = 0; i < keys.length; i += 1) {
      if (this[keys[i]].type === 'one' || this[keys[i]].type === 'many') {
        defs.push(this[keys[i]].fetchData());
      } else if (this[keys[i]].type === 'object') {
        defs.push(this[keys[i]].populate());
      }
    }
    return Promise.all(defs);
  }
  /**
   * set values to all related fields
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  set(value) {
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (!_.isUndefined(value[key])) {
        this[key].set(value[key]);
      }
    }
    super.set(value);
  }
  /**
   * set fieldName to all obect elements
   *
   * @memberof ObjectField
   */
  setFieldName(name) {
    super.setFieldName(name);
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      this[keys[i]].setFieldName(keys[i]);
    }
  }
  /**
   * mark all obect elements to false
   *
   * @memberof ObjectField
   */
  markModified() {
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      this[keys[i]].markModified(false);
    }
  }
  /**
   * return object data
   * @memberof ObjectField
   */
  get({ populate } = {}) {
    return this.getData({ populate });
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
      let defs = [];
      let keys = self.elementsKeys;
      for (let i = 0; i < keys.length; i += 1) {
        defs.push(new Promise((res, rej) => {
          self[keys[i]].validate()
            .then(() => res())
            .catch(err => rej(err));
        }));
      }
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
