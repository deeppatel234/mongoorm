const _ = require('lodash');
const mongodb = require('mongodb');

const AbstractFields = require('./AbstractFields');
const ArrayFields = require('./ArrayFields');

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
    let value = this.get({ populate: true });
    if (!this.props.required && _.isEmpty(value)) {
      return Promise.resolve();
    }
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

  fetchData() {
    return this.record.fetchData();
  }

  validate() {
    const self = this;
    return super.validate().then(function () {
      let value = self.get({ populate: true });
      if (!self.props.required && _.isEmpty(value)) {
        return true;
      }
      return self.record.validate();
    });
  }

  validateRequired(propValue) {
    if (propValue) {
      let value = this.get({ populate: true });
      if (_.isEmpty(value)) {
        return false;
      }
    }
    return true;
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

  fetchData() {
    let defs = [];
    for (let i = 0; i < this._value.length; i += 1) {
      defs.push(this._value[i].fetchData());
    }
    return Promise.all(defs);
  }
}

module.exports = {
  One,
  Many,
};
