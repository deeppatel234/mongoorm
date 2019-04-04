const AbstractFields = require('./AbstractField');
const ObjectField = require('./ObjectField');

function getFieldData(props = {}, fieldClass = AbstractFields) {
  return { props, fieldClass };
}

function prepareFieldsRec(ele) {
  Object.keys(ele).forEach(function (field) {
    if (!ele[field].fieldClass) {
      prepareFieldsRec(ele[field]);
      ele[field] = getFieldData({ ele: ele[field] }, ObjectField);
    }
  });
}

module.exports = {
  getFieldData,
  prepareFieldsRec,
};
