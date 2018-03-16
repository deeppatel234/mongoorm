const AbstractFields = require('AbstractFields.js')

class StringFields extends AbstractFields {

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
