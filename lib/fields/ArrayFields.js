const _ = require('lodash');

const AbstractFields = require('./AbstractFields');
const ObjectField = require('./ObjectFields');

class ArrayFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'array';
  }
  /**
   * call all elements beforeSave before record save
   *
   * @memberof ObjectField
   */
  beforeSave() {
    let defs = [];
    for (let i = 0; i < this._value.length; i += 1) {
      defs.push(this._value[i].beforeSave());
    }
    return Promise.all(defs);
  }

  setFieldName(name) {
    super.setFieldName(name);
    if (this._value) {
      this._value.forEach(v => v.setFieldName(name));
    }
  }

  beforeInit(props) {
    this.ele = props.ele.isFieldObject ? props.ele : new ObjectField({ ele: props.ele });
  }

  clone() {
    let cloned = _.cloneDeep(this);
    cloned._value = cloned._value && cloned._value.map(v => v.clone());
    return cloned;
  }

  getDefaultValue(propValue) {
    return this.getEleObject(super.getDefaultValue(propValue));
  }

  validateType(value) {
    return _.isArray(value);
  }

  set(value) {
    super.set(this.getEleObject(value));
  }

  get({ populate } = {}) {
    return Array.isArray(this._value) ? this._value.map(v => v.get({ populate })) : this._value;
  }

  getRequiredProps() {
    return ['ele'];
  }

  getEle(index) {
    return Array.isArray(this._value) ? this._value[index] : this._value;
  }

  getEleObject(value) {
    if (Array.isArray(value)) {
      value = value.map(v => this.getElement(v));
    }
    return value;
  }

  getElement(value) {
    let ele = this.ele.clone();
    ele.setFieldName(this.fieldName);
    ele.set(value);
    return ele;
  }

  length() {
    return this._value.length;
  }

  push(value) {
    this.isModified = true;
    if (!this._value) {
      this._value = [];
    }
    return this._value.push(this.getElement(value));
  }

  pop() {
    this.isModified = true;
    return this._value.pop();
  }

  validateRequired(propValue, value) {
    return super.validateRequired(propValue, value) && (_.isArray(value) ? value.length > 0 : true);
  }

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
}

module.exports = ArrayFields;
