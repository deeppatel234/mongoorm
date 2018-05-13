
const NativeMethod = require('./Native');
const Record = require('./Record');
const Fields = require('../fields');

/**
 *  Perform Operation in Document
 *
 */
class Document extends NativeMethod {
  constructor() {
    super();

    this.customFunctions = {}; // Initialize Custom Functions
    this.fields = this.prepareFields();
  }
  /**
   * intialize fields
   * override from child class
   * @param {object} fields
   * @memberof Document
   */
  initFields() {
    return {};
  }
  /**
   * prepare fields
   *
   * @param {object} fields
   * @param {object} data
   * @memberof ObjectField
   */
  prepareFields() {
    let ele = this.initFields(Fields);
    let defaultfields = this.defaultFields(Fields);
    if (ele.isFieldObject) {
      Object.assign(ele.elements, defaultfields);
      return ele;
    }
    Object.assign(ele, defaultfields);
    return Fields.Object({ ele });
  }
  /**
   * default fields for storing timestemps and id
   * @param {object} fields
   * @memberof Document
   */
  defaultFields(fields) {
    const defaultFields = {
      _id: fields.ObjectId(),
    };
    this.timestamps = this.getTimestampFields();
    if (this.timestamps) {
      if (this.timestamps.createAt) {
        defaultFields[this.timestamps.createAt] = Fields.DateTime();
      }
      if (this.timestamps.writeAt) {
        defaultFields[this.timestamps.writeAt] = Fields.DateTime();
      }
    }
    return defaultFields;
  }
  /**
   * Return Single Record for document
   * @param {object} record
   * @memberof Document
   */
  create(record = {}, options) {
    return new Record(this, record, options);
  }
  /**
   * Default timestamps fields
   * @returns {object}
   * @memberof Document
   */
  getTimestampFields() {
    return {
      createAt: 'create_at',
      writeAt: 'write_at',
    };
  }
}

module.exports = Document;
