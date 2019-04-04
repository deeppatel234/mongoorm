const mongodb = require('mongodb');
const _isBoolean = require('lodash/isBoolean');
const _isNumber = require('lodash/isNumber');
const _isInteger = require('lodash/isInteger');
const _capitalize = require('lodash/capitalize');
const _isString = require('lodash/isString');

const AbstractField = require('./AbstractField');
const {
  getCurrentDate,
  getCurrentDateTime,
} = require('../base/MongoUtils');

class BooleanField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'boolean';
  }

  validateType(value) {
    return _isBoolean(value);
  }
}

class DateField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'date';
  }

  _getDefaultValue(propsValue) {
    if (this.props.defaultValue === 'now') {
      propsValue = getCurrentDate;
    }
    return super._getDefaultValue(propsValue);
  }

  validateType(value) {
    return (new Date(value) !== 'Invalid Date') && !Number.isNaN(new Date(value));
  }
}

class DateTimeField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'datetime';
  }

  _getDefaultValue(propsValue) {
    if (this.props.defaultValue === 'now') {
      propsValue = getCurrentDateTime;
    }
    return super._getDefaultValue(propsValue);
  }

  validateType(value) {
    return (new Date(value) !== 'Invalid Date') && !Number.isNaN(new Date(value));
  }
}

class MixedField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'mixed';
  }

  beforeInit() {
    this.setValidator([
      { prop: 'enum', func: (pv, v) => pv.indexOf(v) !== -1, message: '{KEY} is not valid enum value' },
    ]);
  }

  validateType() {
    return true;
  }
}

class NumberField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'number';
  }

  beforeInit() {
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
    return _isNumber(value);
  }
}

class IntegerField extends NumberField {
  constructor(props) {
    super(props);
    this.type = 'integer';
  }

  set(value) {
    value = _isNumber(value) ? parseInt(value, 10) : value;
    super.set(value);
  }

  validateType(value) {
    return _isInteger(value);
  }
}

class ObjectIdField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'objectid';
  }

  set(value) {
    super.set(_isString(value) ? this._toObjectId(value) : value);
  }

  toString() {
    let val = this.get();
    if (val) {
      val = val.toString();
    }
    return val;
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

class StringField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'string';
  }

  beforeInit() {
    this.setSetter([
      { prop: 'trim', func: (pv, v) => (pv ? v.trim() : v) },
      { prop: 'lowercase', func: (pv, v) => (pv ? v.toLowerCase() : v) },
      { prop: 'uppercase', func: (pv, v) => (pv ? v.toUpperCase() : v) },
      { prop: 'capitalize', func: (pv, v) => (pv ? _capitalize(v) : v) },
    ]);

    this.setValidator([
      { prop: 'enum', func: (pv, v) => pv.indexOf(v) !== -1, message: '{KEY} is not valid enum value' },
      { prop: 'match', func: this.validateMatch, message: '{KEY} is not valid' },
      { prop: 'maxLength', func: this.validateMaxLength, message: '{KEY} should be max {VAL} length' },
      { prop: 'minLength', func: this.validateMinLength, message: '{KEY} should be min {VAL} length' },
      { prop: 'email', func: this.validateEmail, message: '{KEY} is not valid email' },
    ]);
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
    return _isString(value);
  }
}

module.exports = {
  BooleanField,
  DateField,
  DateTimeField,
  IntegerField,
  MixedField,
  NumberField,
  ObjectIdField,
  StringField,
};
