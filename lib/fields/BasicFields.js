const mongodb = require('mongodb');
const _ = require('lodash');

const AbstractFields = require('./AbstractFields');
const mongoutils = require('../base/mongoutils');

class ObjectField extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'object';

    this.elements = props.ele;
  }

  initValue(value) {
    this.recursiveSetGet(this.elements, value);
    super.initValue(value);
  }

  set(value) {
    this.recursiveSetGet(this.elements, value);
    super.set(value);
  }

  recursiveSetGet(ele, value) {
    let keys = Object.keys(ele);
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (!_.isUndefined(value[key])) {
        if (ele[key].isFieldObject) {
          ele[key].set(value[key]);
          value[key] = ele[key].get();
        } else {
          this.recursiveSetGet(ele[key], value[key]);
        }
      }
    }
  }

  recursiveSetValidate(ele, value = {}) {
    let keys = Object.keys(ele);
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (ele[key].isFieldObject) {
        if (!ele[key].setAndValidate(value[key])) {
          this.errorMessages.push(...ele[key].getErrorMessage(key));
          return false;
        }
      } else {
        return this.recursiveSetValidate(ele[key], value[key]);
      }
    }
    return true;
  }

  validate() {
    let res = super.validate();
    if (res) {
      res = this.recursiveSetValidate(this.elements, this.get());
    }
    return res;
  }

  validateType(value) {
    return _.isObject(value);
  }
}

class ArrayFields extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'array';
    this.ele = props.ele.isFieldObject ? props.ele : new ObjectField({ ele: props.ele });
  }

  push(value) {
    this.markModified = true;
    this.ele.set(value);
    return this._value.push(this.ele.get());
  }

  pop() {
    this.markModified = true;
    return this._value.pop();
  }

  validateRequired(propValue, value) {
    return super.validateRequired(propValue, value) && (_.isArray(value) ? value.length > 0 : true);
  }

  validate() {
    let res = super.validate();

    if (res) {
      for (let i = 0; i < this._value.length; i += 1) {
        if (!this.ele.setAndValidate(this._value[i])) {
          this.errorMessages.push(...this.ele.getErrorMessage(`{KEY} : ${i} index`));
          res = false;
          break;
        }
      }
    }

    return res;
  }

  validateType(value) {
    return _.isArray(value);
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
      { prop: 'min', func: this.validateMin, message: '{KEY} should be min {VAL}' },
      { prop: 'max', func: this.validateMax, message: '{KEY} should be max {VAL}' },
      { prop: 'exclusiveMin', func: this.validateExclusiveMin, message: '{KEY} should be min or equal to {VAL}' },
      { prop: 'exclusiveMax', func: this.validateExclusiveMax, message: '{KEY} should be max or equal to {VAL}' },
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
    value = _.isNumber(value) ? Math.round(value) : value;
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
    ]);

    this.setValidator([
      { prop: 'match', func: this.validateMatch, message: '{KEY} is not match regex' },
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
    return value.length <= value;
  }

  validateMinLength(propsValue, value) {
    return value.length >= propsValue;
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
  ObjectField,
  ObjectIdFields,
  StringFields,
};
