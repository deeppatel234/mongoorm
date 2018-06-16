const _ = require('lodash');
const NativeMethod = require('./Native');
const MongoError = require('../base/Error');
const MongoUtils = require('../base/MongoUtils');
const Record = require('./Record');
const Fields = require('../fields');
const Config = require('../base/Configuration');

/**
 *  Perform Operation in Document
 *
 */
class Document extends NativeMethod {
  constructor(options = {}) {
    super(options);
    this.options = _.defaults(options, this.getDefaultOptions());
    this.customFunctions = {}; // Initialize Custom Functions
    this.fields = this.prepareFields();

    let autoIndex = 'autoIndex' in this.options ? this.options.autoIndex : Config.get('autoIndex', true);
    if (autoIndex) {
      this.createDocumentIndexes();
    }
  }
  /**
   * create indexes in collection
   * @memberof Document
   */
  async createDocumentIndexes() {
    let indexes = [['index'], ['unique', { unique: true }]];

    for (let i = 0; i < indexes.length; i += 1) {
      let index = indexes[i];
      let indexProps = this.fields.getGlobleProps(index[0]);
      if (!_.isEmpty(indexProps)) {
        let obj2dot = MongoUtils.obj2dot(indexProps);
        Object.keys(obj2dot).forEach((key) => {
          if (obj2dot[key] === true) {
            obj2dot[key] = 1;
          }
        });
        try {
          await this.createIndex(obj2dot, index[1]);
          this.onCreateIndex(index[0]);
        } catch (e) {
          this.onCreateIndex(index[0], e);
        }
      }
    }
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
    // TODO: Add Fields option in object fields
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
  create(data, options = {}) {
    return new Record(this, data, _.defaults(options, this.options));
  }
  /**
   * Return default options for document
   * @memberof Document
   */
  getDefaultOptions() {
    return {
      validateBefourSave: true,
    };
  }
  /**
   * @returns document name
   * @memberof Document
   */
  getDocumentName() {
    return MongoError.UnimplementedMethod('getDocumentName');
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
  /**
   * trigger when index are created
   * @param {string} indexname
   * @param {object} error
   * @memberof Document
   */
  onCreateIndex() {
    return true;
  }
}

module.exports = Document;
