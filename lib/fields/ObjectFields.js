const _ = require('lodash');

const AbstractFields = require('./AbstractFields');

class ObjectField extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'object';

    Object.assign(this, _.cloneDeep(props.ele));
    this.elementsKeys = Object.keys(props.ele);
    this.prepareElements();
    delete this.props.ele;
  }
  /**
   * prepare fields
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  prepareElements() {
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (!this[key].isFieldObject) {
        this[key] = new ObjectField({ ele: this[key] });
      }
    }
  }
  /**
   * extract data from all the fields and store in data param
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  getData(mode) {
    let keys = this.elementsKeys;
    let func = this.getGetterFunction(mode);
    let data = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (this[key].type === 'object') {
        let value = this[key].getData(mode);
        if (!_.isEmpty(value)) {
          data[key] = value;
        }
      } else {
        let value = this[key].get();
        if (func(value, this[key])) {
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
    let func = value => !_.isUndefined(value);
    if (mode === 'modified') {
      func = (value, field) => !_.isUndefined(value) && field.isModified;
    }
    return func;
  }

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
  get() {
    return this.getData();
  }
  /**
   * return modified data
   * @memberof ObjectField
   */
  getModifiedData() {
    return this.getData('modified');
  }
  /**
   * validate object elements
   * @memberof ObjectField
   */
  validate() {
    let res = super.validate();
    if (res) {
      let keys = this.elementsKeys;
      for (let i = 0; i < keys.length; i += 1) {
        let key = keys[i];
        if (!this[key].validate()) {
          this.errorMessages.push(...this[key].getErrorMessage(key));
          return false;
        }
      }
    }
    return res;
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