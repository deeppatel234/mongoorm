const _ = require('lodash');
const mongoerror = require('../base/Error');

class AbstractFields {
  constructor(props = {}) {
    this.props = Object.assign(this.getDefaultProps(), props);
    this._checkRequiredProps();
    this.beforeInit(props);
    this.isFieldObject = true;
    this._initValidator(props.validator);
    this._initSetter(props.setter);
    this._setDefaultValue();
  }
  /**
   * check field has required props or not
   * @returns {boolean}
   * @memberof AbstractFields
   */
  _checkRequiredProps() {
    const props = this.getRequiredProps();
    if (_.isEmpty(props)) {
      return true;
    }
    const keys = _.keys(_.pick(this.props, props));
    if (keys.length === props.length) {
      return true;
    }
    throw new mongoerror.RequiredProps(_.difference(props, keys));
  }
  /**
   * initialize setter
   * @memberof AbstractFields
   */
  _initSetter(setter) {
    this.setAttrs = [];
    if (setter) {
      this.setSetter(setter);
    }
  }
  /**
   * initialize validator
   * @memberof AbstractFields
   */
  _initValidator(validator) {
    this.validateAttrs = [];
    if (validator) {
      this.setValidator(validator);
    }
  }
  /**
   * set default value
   * { default: static_value/function }
   * @memberof AbstractFields
   */
  _setDefaultValue() {
    let propValue = this.props.default;
    if (!_.isUndefined(propValue)) {
      this._value = this.getDefaultValue(propValue);
      this.isModified = true;
    }
  }
  /**
   * convert value to props type
   * EX: lowercase = true them convert value to lowercase
   * @memberof AbstractFields
   */
  _setValueByProps() {
    this.setAttrs.forEach((attr) => {
      if (attr.prop in this.props) {
        this._value = attr.func.call(this, this.props[attr.prop], this.get());
      }
    });
  }
  /**
   * validate props of fields like required etc
   * @returns {boolean} props are valid or not
   * @memberof AbstractFields
   */
  _validateProps(value) {
    let self = this;
    let defs = [];
    _.forEach(this.validateAttrs, function (attr) {
      if (attr.prop in self.props) {
        let def = attr.func.call(self, self.props[attr.prop], value);
        if (def instanceof Promise) {
          defs.push(new Promise((res, rej) => {
            def
              .then(() => res())
              .catch(() => rej(self.getDefaultMessage(attr.message, attr.prop).replace('{VAL}', self.props[attr.prop])));
          }));
        } else {
          defs.push(new Promise((res, rej) => {
            if (def) {
              res();
            } else {
              rej(self.getDefaultMessage(attr.message, attr.prop).replace('{VAL}', self.props[attr.prop]));
            }
          }));
        }
      }
    });
    return defs.length === 0 ? Promise.resolve() : new Promise((res, rej) => {
      Promise.all(defs).then(() => res()).catch(err => rej(err));
    });
  }
  /**
   * use this for get default message if message is not define in validator
   * @param {string} message
   * @param {string} prop
   * @memberof AbstractFields
   */
  getDefaultMessage(message, prop) {
    return message || `${prop} is not valid`;
  }
  /**
   * mark or unmark modified
   * @param {boolean} value
   * @memberof AbstractFields
   */
  markModified(value = true) {
    this.isModified = value;
  }
  /**
   * set custom setter
   *
   * @param {obj} setter
   * setter has 3 properties
   * prop : name of props
   * func : validator function take propsValue as argument return new computed value
   * sequence : sequence that validate functions
   * @memberof AbstractFields
   */
  setSetter(setter) {
    if (Array.isArray(setter)) {
      this.setAttrs.push(...setter);
    } else {
      this.setAttrs.push(setter);
    }
    _.sortBy(this.setAttrs, ['sequence']);
  }
  /**
   * set custom validator
   *
   * @param {obj} validator
   * validator has 2 properties
   * prop : {string} name of props
   * func : {function} validator function take propsValue as argument return true/false
   * @memberof AbstractFields
   */
  setValidator(validator) {
    if (Array.isArray(validator)) {
      this.validateAttrs.push(...validator);
    } else {
      this.validateAttrs.push(validator);
    }
  }
  /**
   * validate fields
   * first check type of field then it check other props
   * @returns {boolean} is Valid or not
   * @memberof AbstractFields
   */
  validate() {
    let value = this.get();

    // First Check field is required or not
    if (!this.validateRequired(this.props.required, value)) {
      return Promise.reject(new Error('is required fields'));
    }

    // if not required and value not set then not validate validator
    if (_.isUndefined(value)) {
      return Promise.resolve();
    }

    // validate type of field before validate props
    if (!this.validateType(value)) {
      return Promise.reject(new Error(`is not ${this.type} type`));
    }

    // validate validator
    return _.isEmpty(this.validateAttrs) ? Promise.resolve() : this._validateProps(value);
  }


  /* ========================
      Method to be Override
     ======================== */

  /**
   * override if init something before abstract field init
   * @memberof AbstractFields
   */
  beforeInit() {}
  /**
   * this function is trigger before record save
   * @memberof AbstractFields
   */
  beforeSave() {
    return Promise.resolve();
  }
  /**
   * @return {type} value
   * @memberof AbstractFields
   */
  get() {
    return this._value;
  }
  /**
   * return props
   * param type is string return props value
   *  EX: { a: propValue }
   * param type is list return props value with key
   *  EX: { a.propname : propValue }
   * @param {string|list} props
   */
  getProps(props) {
    if (props) {
      if (Array.isArray(props)) {
        return _.pick(this.props, props);
      }
      return this.props[props];
    }
    return this.props;
  }
  /**
   * compute default value
   * @returns {type} default value
   * @memberof AbstractFields
   */
  getDefaultValue(propValue) {
    if (_.isFunction(propValue)) {
      return propValue();
    }
    return propValue;
  }
  /**
   * return default props
   * override from basic fields
   * @returns object
   * @memberof AbstractFields
   */
  getDefaultProps() {
    return {};
  }
  /**
   * @returns {list} list of required props
   * @memberof AbstractFields
   */
  getRequiredProps() {
    return [];
  }
  /**
   * initialize field value when record initialized
   * @param {any} value
   * @memberof AbstractFields
   */
  initValue(value) {
    this.set(value);
  }
  /**
   * @param {type} value
   * @memberof AbstractFields
   */
  set(value) {
    this._value = value;
    this.isModified = true;
    if (!_.isEmpty(this.setAttrs) && this.validateType(value)) {
      this._setValueByProps();
    }
  }
  /**
   * check field is required or not
   * { required : true/false }
   * @param {boolean} propValue
   * @memberof AbstractFields
   */
  validateRequired(propValue, value) {
    return !propValue || !_.isUndefined(value);
  }
  /**
   * validate type of field
   * override in child field class
   * @returns {boolean}
   * @memberof AbstractFields
   */
  validateType() {
    throw new mongoerror.UnimplementedMethod('Validate type');
  }
}

module.exports = AbstractFields;
