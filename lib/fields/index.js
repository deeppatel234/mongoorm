const AbstractField = require('./AbstractField');
const {
  BooleanField,
  DateField,
  DateTimeField,
  IntegerField,
  NumberField,
  MixedField,
  ObjectIdField,
  StringField,
} = require('./BasicFields');
const ObjectField = require('./ObjectField');
const ArrayField = require('./ArrayField');
const FieldUtils = require('./FieldUtiles');

module.exports = {
  Array: props => FieldUtils.getFieldData(props, ArrayField),
  Boolean: props => FieldUtils.getFieldData(props, BooleanField),
  Date: props => FieldUtils.getFieldData(props, DateField),
  DateTime: props => FieldUtils.getFieldData(props, DateTimeField),
  Integer: props => FieldUtils.getFieldData(props, IntegerField),
  Number: props => FieldUtils.getFieldData(props, NumberField),
  Mixed: props => FieldUtils.getFieldData(props, MixedField),
  Object: props => FieldUtils.getFieldData(props, ObjectField),
  ObjectId: props => FieldUtils.getFieldData(props, ObjectIdField),
  String: props => FieldUtils.getFieldData(props, StringField),
  AbstractField,
  ArrayField,
  BooleanField,
  DateField,
  DateTimeField,
  IntegerField,
  NumberField,
  MixedField,
  ObjectField,
  ObjectIdField,
  StringField,
  FieldUtils,
};
