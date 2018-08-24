const _ = require('lodash');
const mongoerror = require('../base/Error');

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
  constructor(props = {}) {
    /**
     * override field props to defultprops and assign
     *
     * const myField = new AbstractField({ helloProp: 'Hello' })
     * props are { helloProp: 'Hello' }
     * defultProps are { helloProp: 'NewHello', worldProp: 'World' }
     * new props are { helloProp: 'Hello', worldProp: 'World' }
     *
     * assign defultprops if not defined at field initialize
     */
    this.props = Object.assign(this.getDefaultProps(), props);

    // check required props defined to field obejct
    this._checkRequiredProps();

    // Initalize some stuff before abstract field init
    this.beforeInit(props);

    // for identified object is field object
    this.isFieldObject = true;

    // name of this field assined in document
    this.fieldName = 'Undefined';

    // Initalize attrs
    this.validateAttrs = [];
    this.setAttrs = [];

    // set validator defined in props
    this.setValidator(props.validator);

    // set setter defined in props
    this.setSetter(props.setter);

    // set default value dined in props
    this._setDefaultValue();
  }
  /* ========================
      Private
     ======================== */

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
   * set default value { default: static_value/function }
   *
   * const myField = new AbstractField({ default: 'Hello' })
   * myField.get() // 'Hello'
   *
   * const myField = new AbstractField({ default: () => 'World' })
   * myField.get() // 'World'
   *
   * @memberof AbstractFields
   */
  _setDefaultValue() {
    let propValue = this.props.default;
    if (!_.isUndefined(propValue)) {
      this.set(this.getDefaultValue(propValue));
    }
  }
  /**
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
    let self = this;
    let defs = [];
    _.forEach(this.validateAttrs, function (attr) {
      if (attr.prop in self.props) {
        let def = attr.func.call(self, self.props[attr.prop], value);
        if (def instanceof Promise) {
          defs.push(new Promise((res, rej) => {
            def
              .then(() => res())
              .catch(() => rej(self.getErrorMessage(attr.message, attr.prop).replace('{VAL}', self.props[attr.prop])));
          }));
        } else {
          defs.push(new Promise((res, rej) => {
            if (def) {
              res();
            } else {
              rej(self.getErrorMessage(attr.message, attr.prop).replace('{VAL}', self.props[attr.prop]));
            }
          }));
        }
      }
    });
    return defs.length === 0 ? Promise.resolve() : new Promise((res, rej) => {
      Promise.all(defs).then(() => res()).catch(err => rej(err));
    });
  }
  /* ========================
      Public
     ======================== */

  /**
   * Initalize some stuff before abstract field init
   * @memberof AbstractFields
   */
  beforeInit() {}
  /**
   * function is trigger before record save
   * @return {Promise}
   * @memberof AbstractFields
   */
  beforeSave() {
    return Promise.resolve();
  }
  /**
   * get field value
   * @return {type} value
   * @memberof AbstractFields
   */
  get() {
    return this._value;
  }
  /**
   * compute error message with field name
   * @param {string} message
   * @param {string} prop
   * @memberof AbstractFields
   */
  getErrorMessage(msg, prop) {
    return (msg || `${prop} is not valid`).replace('{KEY}', this.fieldName);
  }
  /**
   * return props
   * param type is string return props value
   *  EX: { a: propValue }
   * param type is list return props value with key
   *  EX: { propname : propValue }
   *
   * const myField = new AbstractField({ default: 'Hello' })
   * myField.getProps('default') // 'Hello'
   * myField.getProps(['default']) // { default: 'Hello' }
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
   * check value is defined or not
   *
   * @memberof AbstractFields
   */
  isUndefined() {
    return _.isUndefined(this._value);
  }
  /**
   * mark or unmark modified
   * when save record then only markmodified true fields are saved in db
   *
   * @param {boolean} value
   * @memberof AbstractFields
   */
  markModified(value = true) {
    this.isModified = value;
  }
  /**
   * set value in field
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
   * set field name
   * @param {string} value
   * @memberof AbstractFields
   */
  setFieldName(name) {
    this.fieldName = name || '';
  }
  /**
   * set value setter functions
   * setter function is called when set function in called
   *
   * @param {obj} setter
   * setter object has 3 properties
   * prop : name of props
   * func : validator function take propsValue and fieldValue as argument return new computed value
   * sequence : sequence that validate functions
   *
   * NOTE: func must return old value if value not chaged in setter function
   * @memberof AbstractFields
   */
  setSetter(setter = []) {
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
   * func : {function} validator function take propsValue and field value as argument return promise
   * @memberof AbstractFields
   */
  setValidator(validator = []) {
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
      return Promise.reject(new Error(this.getErrorMessage('{KEY} is required fields')));
    }

    // if not required and value not set then not validate validator
    if (this.isUndefined(value)) {
      return Promise.resolve();
    }

    // validate type of field before validate props
    if (!this.validateType(value)) {
      return Promise.reject(new Error(this.getErrorMessage(`{KEY} is not ${this.type} type`)));
    }

    // validate validator
    return _.isEmpty(this.validateAttrs) ? Promise.resolve() : this._validateProps(value);
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
