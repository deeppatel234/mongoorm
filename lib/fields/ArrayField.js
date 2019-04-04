const _isEmpty = require('lodash/isEmpty');
const _isArray = require('lodash/isArray');

const AbstractField = require('./AbstractField');
const ObjectField = require('./ObjectField');
const FieldUtiles = require('./FieldUtiles');

class ArrayFields extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'array';
  }

  /**
   * =====================
   *    Public Methods
   * =====================
   */

  /**
   * prepare fields before field initialize
   *
   * @memberof ArrayFields
   */
  beforeInit() {
    const { ele } = this.props;
    this._value = [];
    if (!ele.fieldClass) {
      FieldUtiles.prepareFieldsRec(ele);
    }
    this.ele = ele.fieldClass
      ? ele
      : FieldUtiles.getFieldData({ ele }, ObjectField);
  }

  /**
   * return array data
   *
   * @memberof ArrayFields
   */
  get() {
    return this._value.map(v => v.get());
  }

  /**
   * return field information
   * like string, field name , field type etc.
   */
  getFieldInfo() {
    const info = super.getFieldInfo();
    const ClassName = this.ele.fieldClass;
    const ele = new ClassName(this.ele.props);
    ele.setKey(this.key);
    info.ele = ele.getFieldInfo();
    return info;
  }

  /**
   * check props
   *
   * @memberof ArrayFields
   */
  getRequiredProps() {
    return ['ele'];
  }

  /**
   * check value is defined or not
   *
   * @memberof ArrayFields
   */
  isUndefined(value) {
    return _isEmpty(value);
  }

  /**
   * set value
   *
   * @memberof ArrayFields
   */
  set(value) {
    super.set(this._toFieldElement(value));
  }

  /**
   * set field name of all array element
   *
   * @memberof ArrayFields
   */
  setKey(key) {
    super.setKey(key);
    this._value.forEach(v => v.setKey(key));
  }

  /**
   * validate values
   *
   * @memberof ArrayFields
   */
  validate() {
    return super.validate().then(() => {
      const defs = this._value.map(v => v.validate());
      return Promise.all(defs).then(() => {});
    });
  }

  /**
   * validate required value condition
   *
   * @memberof ArrayFields
   */
  validateRequired(propValue, value) {
    return !(propValue && _isEmpty(value));
  }

  /**
   * Validate type of value
   *
   * @param {Array} value
   * @memberof ArrayFields
   */
  validateType(value) {
    return _isArray(value);
  }

  /* ==========================
   *   Array Field Functions
   * ==========================
   */

  /**
   * get element by index
   *
   * @param {Integer} index
   * @memberof ArrayFields
   */
  getByIndex(index) {
    return this._value[index];
  }

  /**
   * pop value from array
   *
   * @memberof ArrayFields
   */
  pop() {
    this.isModified = true;
    return this._value.pop();
  }

  /**
   * push value to array
   *
   * @memberof ArrayFields
   */
  push(value) {
    this.isModified = true;
    const ClassName = this.ele.fieldClass;
    let ele = new ClassName(this.ele.props);
    ele.setKey(this.fieldName);
    ele.set(value);
    return this._value.push(ele);
  }

  /**
   * length of array value
   *
   * @memberof ArrayFields
   */
  length() {
    return this._value.length;
  }

  /**
   * =====================
   *    Private Methods
   * =====================
   */

  /**
   * convert value to field object
   *
   * @param {Any} value
   */
  _toFieldElement(value) {
    if (!Array.isArray(value)) {
      value = [value];
    }
    const ClassName = this.ele.fieldClass;
    return value.map((v) => {
      let ele = new ClassName(this.ele.props);
      ele.setKey(this.fieldName);
      ele.set(v);
      return ele;
    });
  }
}

module.exports = ArrayFields;
