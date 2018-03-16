const BasicFields = require('BasicFields.js')

module.exports = {
  Array: (props) => new BasicFields.ArrayFields(props),
  Binary: (props) => new BasicFields.BinaryFields(props),
  Boolean: (props) => new BasicFields.BooleanFields(props),
  Date: (props) => new BasicFields.DateFields(props),
  DateTime: (props) => new BasicFields.DateTimeFields(props),
  Double: (props) => new BasicFields.DoubleFields(props),
  Integer: (props) => new BasicFields.IntegerFields(props),
  ObjectId: (props) => new BasicFields.ObjectIdFields(props),
  String: (props) => new BasicFields.StringFields(props)
}
