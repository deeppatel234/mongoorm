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
    if (propsValue) {
      return value.toLowerCase()
    }
    return value
  }

  setUppercase (propsValue, value) {
    if (propsValue) {
      return value.toUpperCase()
    }
    return value
  }

  setTrim (propsValue, value) {
    if (propsValue) {
      return value.trim()
    }
    return value
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

}

class BooleanFields extends AbstractFields {

}

class DateFields extends AbstractFields {

}

class DateTimeFields extends AbstractFields {

}

class SelectionFields extends AbstractFields {

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
  SelectionFields,
  StringFields
}
