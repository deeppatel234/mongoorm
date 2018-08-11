const mongoorm = require('../index');

const FieldsObj = {};

function getObj(ele) {
  const ClassName = ele.fieldClass;
  return new ClassName(ele.props);
}

Object.keys(mongoorm.Fields).forEach(function (field) {
  if (field.indexOf('Field') === -1) {
    FieldsObj[field] = props => getObj(mongoorm.Fields[field](props));
  }
});

module.exports = {
  ...mongoorm,
  FieldsObj,
};
