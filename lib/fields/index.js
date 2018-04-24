const BasicFields = require('./BasicFields');

module.exports = {
  Array: props => new BasicFields.ArrayFields(props),
  Boolean: props => new BasicFields.BooleanFields(props),
  Date: props => new BasicFields.DateFields(props),
  DateTime: props => new BasicFields.DateTimeFields(props),
  Integer: props => new BasicFields.IntegerFields(props),
  Number: props => new BasicFields.NumberFields(props),
  Mixed: props => new BasicFields.MixedFields(props),
  ObjectId: props => new BasicFields.ObjectIdFields(props),
  String: props => new BasicFields.StringFields(props),
};
