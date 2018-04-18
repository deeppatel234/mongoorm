const _ = require('lodash');

class AbstractFields {
  constructor(props = {}) {
    this.props = Object.assign(this.getDefaultProps(), props);
    this.errorMessages = [];
    this.isFieldObject = true;
    this._initValidator(props.validator);
    this._initSetter(props.setter);
    this._setDefaultValue();
  }

  /**
   * compute default value
   * @returns {type} default value
   * @memberof AbstractFields
   */
  _getDefaultValue(propValue) {
    if (_.isFunction(propValue)) {
      return propValue();
    }
    return propValue;
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
      this.setSetter(validator);
    }
  }
  /**
   * set default value
   * { default: static_value/function }
   * @memberof AbstractFields
   */
  _setDefaultValue() {
    if (this.props.default) {
      this._value = this._getDefaultValue(this.props.default);
      this.markModified = true;
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
    let isValid = true;
    let self = this;
    _.forEach(this.validateAttrs, function (attr) {
      if (attr.prop in self.props) {
        isValid = attr.func.call(self, self.props[attr.prop], value);
        if (!isValid) {
          self.setErrorMessage(self.getDefaultMessage(attr.message, attr.prop).replace('{VAL}', self.props[attr.prop]));
          return false;
        }
      }
    });
    if (isValid) {
      this.errorMessages = [];
    }
    return isValid;
  }

  /**
   * @return {type} value
   * @memberof AbstractFields
   */
  get() {
    return this._value;
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
   * use this for get default message if message is not define in validator
   * @param {string} message
   * @param {string} prop
   * @memberof AbstractFields
   */
  getDefaultMessage(message, prop) {
    return message || `${prop} is not validate in {KEY}`;
  }
  /**
   * return error message added when validate value
   * replace {KEY} with name of field
   * @param {string} key
   * @returns {list} list of error messages
   * @memberof AbstractFields
   */
  getErrorMessage(key) {
    return this.errorMessages.map(error => error.replace('{KEY}', key));
  }
  /**
   * initialize field value when record initialized
   * @param {any} value
   * @memberof AbstractFields
   */
  initValue(value) {
    this._value = value;
    this.markModified = true;
  }
  /**
   * @param {type} value
   * @memberof AbstractFields
   */
  set(value) {
    this._value = value;
    this.markModified = true;
    if (!_.isEmpty(this.setAttrs)) {
      this._setValueByProps();
    }
  }
  /**
   * set error message
   * @param {string} message
   * @memberof AbstractFields
   */
  setErrorMessage(message) {
    return this.errorMessages.push(message);
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
   * validator has 3 properties
   * prop : {string} name of props
   * func : {function} validator function take propsValue as argument return true/false
   * sequence : {number} sequence that validate functions
   * @memberof AbstractFields
   * TODO: async validator
   */
  setValidator(validator) {
    if (Array.isArray(validator)) {
      this.validateAttrs.push(...validator);
    } else {
      this.validateAttrs.push(validator);
    }
    _.sortBy(this.validateAttrs, 'sequence');
  }
  /**
   * validate fields
   * first check type of field then it check other props
   * @returns {boolean} is Valid or not
   * @memberof AbstractFields
   */
  validate() {
    this.errorMessages = [];
    let value = this.get();

    // First Check field is required or not
    if (!this.validateRequired(this.props.required, value)) {
      this.errorMessages.push('{KEY} is required fields');
      return false;
    }

    // if not required and value not set then not validate validator
    if (!value) {
      return true;
    }

    // validate type of field before validate props
    if (!this.validateType(value)) {
      this.errorMessages.push(`{KEY} is not ${this.type} type`);
      return false;
    }

    // validate validator
    return _.isEmpty(this.validateAttrs) ? true : this._validateProps(value);
  }
  /**
   * check field is required or not
   * { required : true/false }
   * @param {boolean} propValue
   * @memberof AbstractFields
   */
  validateRequired(propValue, value) {
    return !propValue || !!value;
  }
  /**
   * validate type of field
   * override in child field class
   * @returns {boolean}
   * @memberof AbstractFields
   */
  validateType() {
    return false;
  }
}

module.exports = AbstractFields;
