const _isPlainObject = require('lodash/isPlainObject');
const _isEmpty = require('lodash/isEmpty');
const _isUndefined = require('lodash/isUndefined');

const AbstractField = require('./AbstractField');

class ObjectField extends AbstractField {
  constructor(props) {
    super(props);
    this.type = 'object';

    this._prepareElements();
  }

  /**
   * =====================
   *    Public Methods
   * =====================
   */

  /**
   * return object data
   *
   * @memberof ObjectField
   */
  get() {
    return this._getData('all');
  }

  /**
   * return field information
   * like string, field name , field type etc.
   */
  getFieldInfo() {
    const info = super.getFieldInfo();
    info.ele = {};
    this.elementsKeys.forEach((key) => {
      info.ele[key] = this[key].getFieldInfo();
    });
    return info;
  }

  /**
   * scan all elements and return props
   * param type is string return props value
   * param type is list return props value with key
   *
   * @param {any} mode
   * @memberof ObjectField
   */
  getGlobleProps(props) {
    let data = {};
    this.elementsKeys.forEach((key) => {
      let p = this[key].type === 'object' ? this[key].getGlobleProps(props) : this[key].getProps(props);
      if (!_isUndefined(p) && !(_isPlainObject(p) && _isEmpty(p))) {
        data[key] = p;
      }
    });
    return data;
  }

  /**
   * return modified data
   *
   * @memberof ObjectField
   */
  getModifiedData() {
    return this._getData('modified');
  }

  /**
   * required props in field
   *
   * @memberof ObjectField
   */
  getRequiredProps() {
    return ['ele'];
  }

  /**
   * mark all obect elements to false
   *
   * @memberof ObjectField
   */
  markModified() {
    this.elementsKeys.forEach(key => this[key].markModified(false));
  }

  /**
   * set values to all related fields
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  set(value) {
    this.elementsKeys.forEach((key) => {
      if (!_isUndefined(value[key])) {
        this[key].set(value[key]);
      }
    });
    super.set(value);
  }

  /**
   * set fieldName to all obect elements
   *
   * @memberof ObjectField
   */
  setKey(name) {
    super.setKey(name);
    this.elementsKeys.forEach(key => this[key].setKey(key));
  }

  /**
   * validate object elements
   *
   * @memberof ObjectField
   */
  validate() {
    return super.validate().then(() => (
      Promise.all(this.elementsKeys.map(key => this[key].validate())).then(() => {})
    ));
  }

  /**
   * validate modified object elements
   *
   * @memberof ObjectField
   */
  validateModified() {
    return super.validate().then(() => {
      const defs = [];
      this.elementsKeys.forEach((key) => {
        if (this[key].isModified) {
          defs.push(this[key].validate());
        }
      });
      return Promise.all(defs);
    });
  }

  /**
   * validate object type
   * @memberof ObjectField
   */
  validateType(value) {
    return _isPlainObject(value);
  }

  /**
   * =====================
   *    Private Methods
   * =====================
   */

  /**
   * extract data from all the fields and store in data param
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  _getData(mode) {
    const data = {};
    this.elementsKeys.forEach((key) => {
      if (this[key].type === 'object') {
        let value = this[key]._getData(mode);
        if (!_isEmpty(value)) {
          data[key] = value;
        }
      } else {
        const value = this[key].get();
        if (mode === 'all') {
          if (!this[key].isUndefined(value)) {
            data[key] = value;
          }
        } else if (mode === 'modified') {
          if (this[key].isModified) {
            data[key] = value;
          }
        }
      }
    });
    return data;
  }


  _prepareElements() {
    const { ele } = this.props;

    this.elementsKeys = Object.keys(ele);
    this.elementsKeys.forEach((key) => {
      const ClassName = ele[key].fieldClass;
      this[key] = new ClassName(ele[key].props);
    });
  }
}

module.exports = ObjectField;
