const mongodb = require('mongodb')
const AbstractFields = require('./AbstractFields')
const _ = require('lodash')

class StringFields extends AbstractFields {
  constructor (props) {
    super(props)
    this.type = 'string'

    this.setSetter([
      { prop: 'trim', func: this.setTrim },
      { prop: 'lowercase', func: this.setLowercase },
      { prop: 'uppercase', func: this.setUppercase }
    ])

    this.setValidator([
      { prop: 'match', func: this.validateMatch, message: '{KEY} is not match regex' },
      { prop: 'maxLength', func: this.validateMaxLength, message: '{KEY} should be max {VAL} length' },
      { prop: 'minLength', func: this.validateMinLength, message: '{KEY} should be min {VAL} length' },
      { prop: 'email', func: this.validateEmail, message: '{KEY} is not valid email' }
    ])
  }

  // ==============
  // Setters
  // ==============

  setLowercase (propsValue, value) {
    return propsValue ? value.toLowerCase() : value
  }

  setUppercase (propsValue, value) {
    return propsValue ? value.toUpperCase() : value
  }

  setTrim (propsValue, value) {
    return propsValue ? value.trim() : value
  }

  // ==========================
  // Validator Functions
  // ==========================

  validateEmail (propsValue, value) {
    return !propsValue || /\S+@\S+\.\S+/.test(value)
  }

  validateMatch (propsValue, value) {
    return !!value.match(propsValue)
  }

  validateMaxLength (propsValue, value) {
    return value.length <= value
  }

  validateMinLength (propsValue, value) {
    return value.length >= propsValue
  }

  validateType (value) {
    return _.isString(value)
  }
}

class NumberFields extends AbstractFields {

}

class IntegerFields extends NumberFields {

}

class DoubleFields extends NumberFields {

}

class ArrayFields extends AbstractFields {

}

class BinaryFields extends AbstractFields {

}

class ObjectIdFields extends AbstractFields {
  constructor (props) {
    super(props)
    this.type = 'objectid'
  }

  set (value) {
    this._value = _.isString(value) ? this._toObjectId(value) : value
  }

  validateType (value) {
    return this._isValid(value)
  }

  _toObjectId (hexstr) {
    return mongodb.ObjectID(hexstr)
  }

  _isValid (value) {
    return mongodb.ObjectID.isValid(value)
  }
}

class BooleanFields extends AbstractFields {

}

class DateFields extends AbstractFields {

}

class DateTimeFields extends AbstractFields {
  constructor (props) {
    super(props)
    this.type = 'datetime'
  }

  _getDefaultValue (propsValue) {
    if (this.props.default === 'now') {
      propsValue = this.getCurrentDateTime
    }
    return super._getDefaultValue(propsValue)
  }

  validateType (value) {
    return (new Date(value) !== 'Invalid Date') && !isNaN(new Date(value))
  }

  getCurrentDateTime () {
    return new Date().toUTCString()
  }
}

module.exports = {
  ArrayFields,
  BinaryFields,
  BooleanFields,
  DateFields,
  DateTimeFields,
  DoubleFields,
  IntegerFields,
  ObjectIdFields,
  StringFields
}
