const AbstractFields = require('./AbstractFields');
const ObjectFields = require('./ObjectFields');

function getFieldData(props = {}, fieldClass = AbstractFields) {
  return { props, fieldClass };
}

function prepareFieldsRec(ele) {
  Object.keys(ele).forEach(function (field) {
    if (!ele[field].fieldClass) {
      prepareFieldsRec(ele[field]);
      ele[field] = getFieldData({ ele: ele[field] }, ObjectFields);
    }
  });
}

module.exports = {
  getFieldData,
  prepareFieldsRec,
};
