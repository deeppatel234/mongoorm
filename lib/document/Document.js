
const _ = require('lodash');
const NativeMethod = require('./Native');
const Record = require('./Record');
const Fields = require('../fields');
const MongoError = require('../base/Error');
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
   * base function for validate all fields
   * @param {any} fields
   * @memberof Document
   */
  _validateSchema(fields) {
    const self = this;
    Object.keys(fields).forEach((k) => {
      if (fields[k].isFieldObject) {
        if (!fields[k].validate()) {
          throw new MongoError.ValidationError(fields[k].getErrorMessage(k));
        }
      } else {
        self._validateSchema(fields[k]);
      }
    });
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
  /**
   * Validate User record
   * @param {object|array} record
   * @memberof Document
   */
  validateData(fields) {
    try {
      this._validateSchema(fields);
    } catch (e) {
      return { isValid: false, errorMessage: e.message };
    }
    return { isValid: true };
  }
}

module.exports = Document;
