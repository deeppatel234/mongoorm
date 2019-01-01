const BasicFields = require('./BasicFields');
const ObjectFields = require('./ObjectFields');
const ArrayFields = require('./ArrayFields');
const FieldUtils = require('./FieldUtiles');

module.exports = {
  Array: props => FieldUtils.getFieldData(props, ArrayFields),
  Boolean: props => FieldUtils.getFieldData(props, BasicFields.BooleanFields),
  Date: props => FieldUtils.getFieldData(props, BasicFields.DateFields),
  DateTime: props => FieldUtils.getFieldData(props, BasicFields.DateTimeFields),
  Integer: props => FieldUtils.getFieldData(props, BasicFields.IntegerFields),
  Number: props => FieldUtils.getFieldData(props, BasicFields.NumberFields),
  Mixed: props => FieldUtils.getFieldData(props, BasicFields.MixedFields),
  Object: props => FieldUtils.getFieldData(props, ObjectFields),
  ObjectId: props => FieldUtils.getFieldData(props, BasicFields.ObjectIdFields),
  String: props => FieldUtils.getFieldData(props, BasicFields.StringFields),
  ArrayField: ArrayFields,
  BooleanField: BasicFields.BooleanFields,
  DateField: BasicFields.DateFields,
  DateTimeField: BasicFields.DateTimeFields,
  IntegerField: BasicFields.IntegerFields,
  NumberField: BasicFields.NumberFields,
  MixedField: BasicFields.MixedFields,
  ObjectField: ObjectFields,
  ObjectIdField: BasicFields.ObjectIdFields,
  StringField: BasicFields.StringFields,
  FieldUtils,
};
