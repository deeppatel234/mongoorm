const _ = require('lodash');

const AbstractFields = require('./AbstractFields');

class ObjectField extends AbstractFields {
  constructor(props) {
    super(props);
    this.type = 'object';

    Object.assign(this, this.cloneFields(this.prepareElements(props.ele)));
    this.elementsKeys = Object.keys(props.ele);
    delete this.props.ele;
  }
  /**
   * call all fields beforeSave before record save
   *
   * @memberof ObjectField
   */
  beforeSave() {
    let keys = this.elementsKeys;
    let defs = [];
    for (let i = 0; i < keys.length; i += 1) {
      defs.push(this[keys[i]].beforeSave());
    }
    return Promise.all(defs);
  }
  /**
   * clone fields
   *
   * @memberof ObjectField
   */
  cloneFields(fields) {
    let clonedFields = {};
    _.each(_.keys(fields), function (key) {
      clonedFields[key] = fields[key].clone();
    });
    return clonedFields;
  }
  /**
   * clone current field
   *
   * @memberof ObjectField
   */
  clone() {
    let cloned = _.cloneDeep(this);
    let keys = cloned.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      cloned[keys[i]] = cloned[keys[i]].clone();
    }
    return cloned;
  }
  /**
   * prepare fields
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  prepareElements(fields) {
    let keys = _.keys(fields);
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (!fields[key].isFieldObject) {
        fields[key] = new ObjectField({ ele: fields[key] });
      }
    }
    return fields;
  }
  /**
   * extract data from all the fields and store in data param
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  getData({ mode = 'all', populate = false }) {
    let keys = this.elementsKeys;
    let func = this.getGetterFunction(mode);
    let data = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (this[key].type === 'object') {
        let value = this[key].getData({ mode, populate });
        if (!_.isEmpty(value)) {
          data[key] = value;
        }
      } else {
        let value = this[key].get({ populate });
        if (func(value, this[key])) {
          data[key] = value;
        }
      }
    }
    return data;
  }
  /**
   * getter function is used in get data function
   * if function returns true them fields data is returned else ignore
   *
   * @param {any} mode
   * @memberof ObjectField
   */
  getGetterFunction(mode) {
    let func = value => !_.isUndefined(value);
    if (mode === 'modified') {
      func = (value, field) => !_.isUndefined(value) && field.isModified;
    }
    return func;
  }
  /**
   * scan all elements and return props
   * param type is string return props value
   *  EX: { a: propValue }
   * param type is list return props value with key
   *  EX: { a.propname : propValue }
   * @param {any} mode
   * @memberof ObjectField
   */
  getGlobleProps(props) {
    let keys = this.elementsKeys;
    let data = {};
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      let p = this[key].type === 'object' ? this[key].getGlobleProps(props) : this[key].getProps(props);
      if (!_.isUndefined(p) && !(_.isPlainObject(p) && _.isEmpty(p))) {
        data[key] = p;
      }
    }
    return data;
  }

  getRequiredProps() {
    return ['ele'];
  }
  populate() {
    let keys = this.elementsKeys;
    let defs = [];
    for (let i = 0; i < keys.length; i += 1) {
      if (this[keys[i]].type === 'one' || this[keys[i]].type === 'many') {
        defs.push(this[keys[i]].fetchData());
      }
    }
    return Promise.all(defs);
  }
  /**
   * set values to all related fields
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  set(value) {
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      let key = keys[i];
      if (!_.isUndefined(value[key])) {
        this[key].set(value[key]);
      }
    }
    super.set(value);
  }
  /**
   * set fieldName to all obect elements
   *
   * @memberof ObjectField
   */
  setFieldName(name) {
    super.setFieldName(name);
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      this[keys[i]].setFieldName(keys[i]);
    }
  }
  /**
   * mark all obect elements to false
   *
   * @memberof ObjectField
   */
  markModified() {
    let keys = this.elementsKeys;
    for (let i = 0; i < keys.length; i += 1) {
      this[keys[i]].markModified(false);
    }
  }
  /**
   * return object data
   * @memberof ObjectField
   */
  get({ populate } = {}) {
    return this.getData({ populate });
  }
  /**
   * return modified data
   * @memberof ObjectField
   */
  getModifiedData() {
    return this.getData({ mode: 'modified' });
  }
  /**
   * validate object elements
   * @memberof ObjectField
   */
  validate() {
    let self = this;
    return super.validate().then(function () {
      let defs = [];
      let keys = self.elementsKeys;
      for (let i = 0; i < keys.length; i += 1) {
        defs.push(new Promise((res, rej) => {
          self[keys[i]].validate()
            .then(() => res())
            .catch(err => rej(new Error(err)));
        }));
      }
      return new Promise((res, rej) => {
        Promise.all(defs).then(() => res()).catch(err => rej(err));
      });
    });
  }
  /**
   * validate object type
   * @memberof ObjectField
   */
  validateType(value) {
    return _.isPlainObject(value);
  }
}

module.exports = ObjectField;
