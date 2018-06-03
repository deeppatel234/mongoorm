const mongodb = require('mongodb');
const _ = require('lodash');

const AbstractFields = require('./AbstractFields');
const ObjectField = require('./ObjectFields');
const mongoutils = require('../base/MongoUtils');

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
      defs.push(this._value[i]);
    }
    return Promise.all(defs);
  }

  beforeInit(props) {
    this.ele = props.ele.isFieldObject ? props.ele : new ObjectField({ ele: props.ele });
  }

  clone() {
    let cloned = _.cloneDeep(this);
    cloned._value = cloned._value.map(v => v.clone());
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

  get() {
    return Array.isArray(this._value) ? this._value.map(v => v.get()) : this._value;
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
    let ele = _.cloneDeep(this.ele);
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
            .catch(err => rej(new Error(`{KEY} : ${i} index ${err}`)));
        }));
      }
      return new Promise((res, rej) => {
        Promise.all(defs).then(() => res()).catch(err => rej(err));
      });
    });
  }
}

class BooleanFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'boolean';
  }

  validateType(value) {
    return _.isBoolean(value);
  }
}

class DateFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'datetime';
  }

  _getDefaultValue(propsValue) {
    if (this.props.default === 'now') {
      propsValue = mongoutils.getCurrentDate;
    }
    return super._getDefaultValue(propsValue);
  }

  validateType(value) {
    return (new Date(value) !== 'Invalid Date') && !Number.isNaN(new Date(value));
  }
}

class DateTimeFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'datetime';
  }

  _getDefaultValue(propsValue) {
    if (this.props.default === 'now') {
      propsValue = mongoutils.getCurrentDateTime;
    }
    return super._getDefaultValue(propsValue);
  }

  validateType(value) {
    return (new Date(value) !== 'Invalid Date') && !Number.isNaN(new Date(value));
  }
}

class MixedFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'mixed';

    this.setValidator([
      { prop: 'enum', func: (pv, v) => pv.indexOf(v) !== -1, message: '{KEY} is not valid enum value' },
    ]);
  }

  validateType() {
    return true;
  }
}

class NumberFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'number';

    this.setValidator([
      { prop: 'enum', func: (pv, v) => pv.indexOf(v) !== -1, message: '{KEY} is not valid enum value' },
      { prop: 'min', func: this.validateMin, message: '{KEY} should be minimum {VAL}' },
      { prop: 'max', func: this.validateMax, message: '{KEY} should be maximum {VAL}' },
      { prop: 'exclusiveMin', func: this.validateExclusiveMin, message: '{KEY} should be greater or equal to {VAL}' },
      { prop: 'exclusiveMax', func: this.validateExclusiveMax, message: '{KEY} should be less or equal to {VAL}' },
      { prop: 'multipleOf', func: this.validateMultipleOf, message: '{KEY} should be multiple of {VAL}' },
    ]);
  }

  validateMin(propsValue, value) {
    return propsValue < value;
  }

  validateExclusiveMin(propsValue, value) {
    return propsValue <= value;
  }

  validateMax(propsValue, value) {
    return propsValue > value;
  }

  validateExclusiveMax(propsValue, value) {
    return propsValue >= value;
  }

  validateMultipleOf(propsValue, value) {
    return value % propsValue === 0;
  }

  validateType(value) {
    return _.isNumber(value);
  }
}

class ObjectIdFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'objectid';
  }

  set(value) {
    this._value = _.isString(value) ? this._toObjectId(value) : value;
  }

  validateType(value) {
    return this._isValid(value);
  }

  _toObjectId(hexstr) {
    return mongodb.ObjectID(hexstr);
  }

  _isValid(value) {
    return mongodb.ObjectID.isValid(value);
  }
}

class IntegerFields extends NumberFields {
  constructor(props) {
    super(props);
    this.type = 'integer';
  }

  set(value) {
    value = _.isNumber(value) ? parseInt(value, 10) : value;
    super.set(value);
  }

  validateType(value) {
    return _.isInteger(value);
  }
}

class StringFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'string';

    this.setSetter([
      { prop: 'trim', func: this.setTrim },
      { prop: 'lowercase', func: this.setLowercase },
      { prop: 'uppercase', func: this.setUppercase },
      { prop: 'capitalize', func: this.capitalize },
    ]);

    this.setValidator([
      { prop: 'enum', func: (pv, v) => pv.indexOf(v) !== -1, message: '{KEY} is not valid enum value' },
      { prop: 'match', func: this.validateMatch, message: '{KEY} is not valid' },
      { prop: 'maxLength', func: this.validateMaxLength, message: '{KEY} should be max {VAL} length' },
      { prop: 'minLength', func: this.validateMinLength, message: '{KEY} should be min {VAL} length' },
      { prop: 'email', func: this.validateEmail, message: '{KEY} is not valid email' },
    ]);
  }

  // ==============
  // Setters
  // ==============

  setLowercase(propsValue, value) {
    return propsValue ? value.toLowerCase() : value;
  }

  setUppercase(propsValue, value) {
    return propsValue ? value.toUpperCase() : value;
  }

  setTrim(propsValue, value) {
    return propsValue ? value.trim() : value;
  }

  capitalize(propsValue, value) {
    return propsValue ? (value.charAt(0).toUpperCase() + value.slice(1)) : value;
  }

  // ==========================
  // Validator Functions
  // ==========================

  validateEmail(propsValue, value) {
    return !propsValue || /\S+@\S+\.\S+/.test(value);
  }

  validateMatch(propsValue, value) {
    return !!value.match(propsValue);
  }

  validateMaxLength(propsValue, value) {
    return value.length <= Number(propsValue);
  }

  validateMinLength(propsValue, value) {
    return value.length >= Number(propsValue);
  }

  validateType(value) {
    return _.isString(value);
  }
}

module.exports = {
  ArrayFields,
  BooleanFields,
  DateFields,
  DateTimeFields,
  IntegerFields,
  NumberFields,
  MixedFields,
  ObjectIdFields,
  StringFields,
};
