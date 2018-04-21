
const _ = require('lodash');
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

    // Initialize Custom Functions
    this.customFunctions = {};

    // Default timestamps fields
    this.timestampFields = {
      createAt: 'create_at',
      writeAt: 'write_at',
    };
    // Initialize fields
    this.fields = _.defaults(this.initFields(Fields), this.defaultFields(Fields));
  }

  /**
   * this is default fields for storing writing and creating date
   * @memberof Document
   */
  _createWriteFields() {
    const tsf = {};
    if (this.timestampFields.createAt) {
      tsf[this.timestampFields.createAt] = Fields.DateTime({ default: 'now' });
    }
    if (this.timestampFields.writeAt) {
      tsf[this.timestampFields.writeAt] = Fields.DateTime({ default: 'now' });
    }
    return tsf;
  }

  /**
   * define fields
   * override from child class
   * @param {object} fields
   * @memberof Document
   */
  initFields() {
    return {};
  }
  /**
   * this is default fields for storing writing and creating date
   * @param {object} fields
   * @memberof Document
   */
  defaultFields(fields) {
    const defaultFields = {
      _id: fields.ObjectId(),
    };
    if (this.timestampFields) {
      _.assignIn(defaultFields, this._createWriteFields());
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
}

module.exports = Document;
