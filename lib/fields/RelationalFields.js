const _ = require('lodash');
const mongodb = require('mongodb');

const AbstractFields = require('./AbstractFields');
const { ArrayFields } = require('./BasicFields');

class One extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'one';
    this.record = props.doc.create();

    return this.fieldProxy();
  }

  fieldProxy() {
    return new Proxy(this, {
      get(target, name) {
        if (target.record.ele.elementsKeys.indexOf(name) !== -1) {
          return target.record[name];
        }
        return target[name];
      },
    });
  }

  getModifiedData() {
    this.record._getFieldsValue({ mode: 'modified', id: false, timestamp: false });
  }

  set(value) {
    mongodb.ObjectID.isValid(value) || _.isString(value)
      ? this.record.setId(value) : this.record.ele.set(value);
  }

  beforeSave() {
    return this.record.save();
  }

  clone() {
    let cloned = _.cloneDeep(this);
    cloned.record = cloned.record.recordProxy();
    return cloned.fieldProxy();
  }

  get({ populate } = {}) {
    if (Array.isArray(populate)) {
      populate = populate.indexOf(this.fieldName) !== -1;
    }
    return populate ? this.record.toJson() : this.record.getId();
  }

  getRequiredProps() {
    return ['doc'];
  }

  validate() {
    return this.record.validate();
  }

  validateType() {
    return true;
  }
}

class Many extends ArrayFields {
  constructor(props) {
    super(props);
    this.type = 'many';
  }

  beforeInit(props) {
    this.ele = new One({ doc: props.doc });
  }

  getRequiredProps() {
    return ['doc'];
  }
}

module.exports = {
  One,
  Many,
};
