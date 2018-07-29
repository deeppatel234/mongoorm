const _ = require('lodash');

const AbstractFields = require('./AbstractFields');
const ObjectField = require('./ObjectFields');


class ArrayFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'array';
  }
  /* ========================
      Override Functions
    ======================== */
  /**
   * call all method before field initialize
   *
   * @memberof ArrayFields
   */
  beforeInit(props) {
    this._value = [];
    this.ele = props.ele.isFieldObject ? props.ele : new ObjectField({ ele: props.ele });
  }
  /**
   * call all elements beforeSave before record save
   *
   * @memberof ArrayFields
   */
  beforeSave() {
    return Promise.all(this._value.map(v => v.beforeSave()));
  }
  /**
   * Clone all the array element
   *
   * @memberof ArrayFields
   */
  clone() {
    let cloned = _.cloneDeep(this);
    cloned._value = cloned._value.map(v => v.clone());
    return cloned;
  }
  /**
   * return array data
   *
   * @memberof ArrayFields
   */
  get({ populate } = {}) {
    return this._value.map(v => v.get({ populate }));
  }
  /**
   * get default value from props
   *
   * @memberof ArrayFields
   */
  getDefaultValue(propValue) {
    return this.toFieldElement(super.getDefaultValue(propValue));
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
  isUndefined() {
    return _.isEmpty(this._value);
  }
  /**
   * set value
   *
   * @memberof ArrayFields
   */
  set(value) {
    super.set(this.toFieldElement(value));
  }
  /**
   * set field name of all array element
   *
   * @memberof ArrayFields
   */
  setFieldName(name) {
    super.setFieldName(name);
    this._value.forEach(v => v.setFieldName(name));
  }
  /**
   * validate values
   *
   * @memberof ArrayFields
   */
  validate() {
    let self = this;
    return super.validate().then(function () {
      let defs = [];
      for (let i = 0; i < self._value.length; i += 1) {
        defs.push(new Promise((res, rej) => {
          self._value[i].validate()
            .then(() => res())
            .catch(err => rej(self.getErrorMessage(`{KEY} (${i} index) :: ${err}`)));
        }));
      }
      return new Promise((res, rej) => {
        Promise.all(defs).then(() => res()).catch(err => rej(err));
      });
    });
  }
  /**
   * validate required value condition
   *
   * @memberof ArrayFields
   */
  validateRequired(propValue, value) {
    return !(propValue && _.isEmpty(value));
  }
  /**
   * Validate type of value
   *
   * @param {Array} value
   * @memberof ArrayFields
   */
  validateType(value) {
    return _.isArray(value);
  }
  /**
   * validate field is empty or not
   * @memberof ArrayFields
   */
  validateUndefined() {
    return this._value.length === 0;
  }
  /* ========================
      Array Field Functions
    ======================== */
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
    let ele = this.ele.clone();
    ele.setFieldName(this.fieldName);
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
   * convert value to field object
   *
   * @param {Any} value
   */
  toFieldElement(value) {
    if (!Array.isArray(value)) {
      value = [value];
    }
    return value.map((v) => {
      let ele = this.ele.clone();
      ele.setFieldName(this.fieldName);
      ele.set(v);
      return ele;
    });
  }
}

module.exports = ArrayFields;
