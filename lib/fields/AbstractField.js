const _isFunction = require('lodash/isFunction');
const _isUndefined = require('lodash/isUndefined');
const _difference = require('lodash/difference');
const _sortBy = require('lodash/sortBy');
const _pick = require('lodash/pick');

const { RequiredProps, UnimplementedMethod } = require('../base/Error');

/**
 * This is the abstract field class used by all field in a document.
 *
 * The responsabilities of a field class are mainly:
 * - check required props defined
 * - validate field type, check required field and valiate props
 * - set and get field value
 * - set values by setter functions
 *
 * @module fields.AbstractField
 */
class AbstractFields {
  constructor(props) {
    // override field props to defultprops and assign
    this.props = Object.assign(this.getDefaultProps(), props);

    // check required props defined to field obejct
    this._checkRequiredProps();

    // key of this field assined in document
    this.key = 'Undefined';

    // Initalize attrs
    this.setAttrs = [];
    this.setSetter(this.props.setter);

    this.validateAttrs = [];
    this.setValidator(this.props.validator);

    // Initalize some stuff before abstract field init
    this.beforeInit();

    // set default value defined in props
    this._setDefaultValue();
  }

  /**
   * =====================
   *    Public Methods
   * =====================
   */

  /**
   * Initalize some stuff before abstract field init
   * @memberof AbstractFields
   */
  beforeInit() {}

  /**
   * get field value
   *
   * @return {Any} value
   * @memberof AbstractFields
   */
  get() {
    return this._value;
  }

  /**
   * return props
   * param type is string return props value
   * param type is list return object
   *
   * const myField = new AbstractField({ default: 'Hello' })
   * myField.getProps('default') // 'Hello'
   * myField.getProps(['default']) // { default: 'Hello' }
   * @param {string|list} props
   */
  getProps(props) {
    if (props) {
      if (Array.isArray(props)) {
        return _pick(this.props, props);
      }
      return this.props[props];
    }
    return this.props;
  }

  /**
   * return default props
   * override from basic fields
   *
   * @returns object
   * @memberof AbstractFields
   */
  getDefaultProps() {
    return {};
  }

  /**
   * return field information
   * like string, field name , field type etc.
   */
  getFieldInfo() {
    return {
      name: this.key,
      string: this.props.string || this.key,
      type: this.type,
    };
  }

  /**
   * @returns {list} list of required props
   * @memberof AbstractFields
   */
  getRequiredProps() {
    return [];
  }

  /**
   * check value is defined or not
   *
   * @memberof AbstractFields
   */
  isUndefined(value) {
    return _isUndefined(value);
  }

  /**
   * mark or unmark modified
   * when save record then only markmodified true fields are saved in db
   *
   * @param {boolean} value
   * @memberof AbstractFields
   */
  markModified(isModified) {
    this.isModified = isModified;
  }

  /**
   * set value in field
   *
   * convert value to props type
   *
   * const myField = new AbstractField({ lowercase: true })
   * myField.set('hello')
   * myField.get() // 'HELLO'
   *
   * function (propValue, fieldValue) {
   *  if (propsValue) {
   *    return propValue.toLowerCase();  // return new value
   *  }
   *  return propsValue; // must return old value if value not changed
   * }
   *
   * @param {Any} value
   * @memberof AbstractFields
   */
  set(value) {
    this._value = value;
    this.isModified = true;
    this._setValueBySetters();
  }

  /**
   * set field name
   *
   * @param {string} key
   * @memberof AbstractFields
   */
  setKey(key) {
    if (key) {
      this.key = key;
    }
  }

  /**
   * set value setter functions
   * setter function is called when set function in called
   *
   * setter object has 3 properties
   * prop : name of props
   * func : validator function take propsValue and fieldValue as argument return new computed value
   * sequence : sequence that validate functions
   *
   * NOTE: func must return old value if value not chaged in setter function
   * @param {list} setter
   * @memberof AbstractFields
   */
  setSetter(setter) {
    if (!setter) {
      return;
    }

    if (Array.isArray(setter)) {
      this.setAttrs.push(...setter);
    } else {
      this.setAttrs.push(setter);
    }
    _sortBy(this.setAttrs, ['sequence']);
  }

  /**
   * set custom validator
   *
   * @param {obj} validator
   * validator has 2 properties
   * prop : {string} name of props
   * func : {function} validator function take propsValue and field value as argument return promise
   * @memberof AbstractFields
   */
  setValidator(validator) {
    if (!validator) {
      return;
    }

    if (Array.isArray(validator)) {
      this.validateAttrs.push(...validator);
    } else {
      this.validateAttrs.push(validator);
    }
  }

  /**
   * validate fields
   * first check type of field then it check other props
   *
   * @returns {boolean} is Valid or not
   * @memberof AbstractFields
   */
  validate() {
    const value = this.get();

    // First Check field is required or not
    if (!this.validateRequired(this.props.required, value)) {
      return Promise.reject(new Error(this._getErrorMessage('{KEY} is required fields')));
    }

    // if not required and value not set then not validate validator
    if (this.isUndefined(value)) {
      return Promise.resolve();
    }

    // validate type of field before validate props
    if (!this.validateType(value)) {
      return Promise.reject(new Error(this._getErrorMessage(`{KEY} is not ${this.type} type`)));
    }

    // validate validator
    return this.validateAttrs.length ? this._validateProps(value) : Promise.resolve();
  }

  /**
   * check field is required or not
   * { required : true/false }
   *
   * @param {boolean} propValue
   * @memberof AbstractFields
   */
  validateRequired(propValue, value) {
    if (propValue) {
      return !_isUndefined(value);
    }
    return true;
  }

  /**
   * validate type of field
   * override in child field class
   *
   * @returns {boolean}
   * @memberof AbstractFields
   */
  validateType() {
    throw new UnimplementedMethod('validateType');
  }

  /**
   * =====================
   *    Private Methods
   * =====================
   */

  /**
   * compute default value
   * @returns {type} default value
   * @memberof AbstractFields
   */
  _getDefaultValue(propValue) {
    if (_isFunction(propValue)) {
      return propValue();
    }
    return propValue;
  }

  /**
   * check required props defined to field obejct
   *
   * const myField = new AbstractField({ helloProp: 'Hello' })
   *
   * required props ['worldProp']
   *
   * method raise error because worldProps not passed in field
   *
   * @returns {boolean} all the props are passed in field
   * @return {Error} props are missing when init initialize
   * @memberof AbstractFields
   */
  _checkRequiredProps() {
    const requiredProps = this.getRequiredProps();
    if (requiredProps.length !== 0) {
      const requiredKeys = _difference(requiredProps, Object.keys(this.props));
      if (requiredKeys.length) {
        throw new RequiredProps(requiredKeys);
      }
    }
    return true;
  }

  /**
   * compute error message with field key
   *
   * @param {string} message
   * @param {string} prop
   * @memberof AbstractFields
   */
  _getErrorMessage(msg, prop) {
    return (msg || `${prop} is not valid`).replace('{KEY}', this.key);
  }

  /**
   * compute validate error message with field key
   *
   * @param {object} attr
   * @memberof AbstractFields
   */
  _getVaidateErrorMessage(attr) {
    return this._getErrorMessage(attr.message, attr.prop).replace('{VAL}', this.props[attr.prop]);
  }

  /**
   * compute default value
   *
   * @memberof AbstractFields
   */
  _setDefaultValue() {
    const { defaultValue } = this.props;
    if (!_isUndefined(defaultValue)) {
      this.set(this._getDefaultValue(defaultValue));
    }
  }

  /**
   * set value by setters
   *
   * @memberof AbstractFields
   */
  _setValueBySetters() {
    if (this.setAttrs.length) {
      this.setAttrs.forEach((attr) => {
        if (this.props[attr.prop]) {
          this._value = attr.func.call(this, this.props[attr.prop], this.get());
        }
      });
    }
  }

  /**
   * validate props
   *
   * const myField = new AbstractField({ minLength: 3 })
   * myField.set('hi')
   * await myField.validate() // reject with min length should be 3 error
   *
   * function (propValue, fieldValue) {
   *  if (propsValue && fieldValue.length >= 3) {
   *    return Promise.reject()  // return new value
   *  }
   *  return Promise.resolve(); // must return old value if value not changed
   * }
   *
   * @returns {Promise} resolve if valid and reject with err if not valid
   * @memberof AbstractFields
   */
  _validateProps(value) {
    const defs = [];

    this.validateAttrs.forEach((attr) => {
      if (this.props[attr.prop]) {
        const validatorRes = attr.func.call(this, this.props[attr.prop], value);
        if (validatorRes instanceof Promise) {
          defs.push(new Promise((res, rej) => {
            validatorRes
              .then(() => res())
              .catch(() => rej(new Error(this._getVaidateErrorMessage(attr))));
          }));
        } else {
          defs.push(new Promise((res, rej) => {
            if (validatorRes) {
              res();
            } else {
              rej(new Error(this._getVaidateErrorMessage(attr)));
            }
          }));
        }
      }
    });

    return defs.length === 0 ? Promise.resolve() : Promise.all(defs);
  }
}

module.exports = AbstractFields;
