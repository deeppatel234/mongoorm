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
    const ClassName = this.fields.fieldClass;
    const ele = new ClassName(this.fields.props);

    for (let i = 0; i < indexes.length; i += 1) {
      let index = indexes[i];
      let indexProps = ele.getGlobleProps(index[0]);
      if (!_.isEmpty(indexProps)) {
        let obj2dot = MongoUtils.obj2dot(indexProps);
        Object.keys(obj2dot).forEach(async (key) => {
          if (obj2dot[key] === true) {
            const data = {};
            data[key] = 1;
            try {
              await this.createIndex(data, index[1]);
              this.onCreateIndex(index[0]);
            } catch (e) {
              this.onCreateIndex(index[0], e);
            }
          }
        });
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
    Object.assign(ele, defaultfields);
    Fields.FieldUtils.prepareFieldsRec(ele);
    return Fields.Object({ ele });
  }
  /**
   * default fields for storing timestemps and id
   * @param {object} fields
   * @memberof Document
   */
  defaultFields(fields) {
    const defaultFields = {
      _id: fields.ObjectId({ string: 'ID' }),
    };
    this.timestamps = this.getTimestampFields();
    if (this.timestamps) {
      if (this.timestamps.createAt) {
        defaultFields[this.timestamps.createAt] = Fields.DateTime({ string: 'Create At' });
      }
      if (this.timestamps.writeAt) {
        defaultFields[this.timestamps.writeAt] = Fields.DateTime({ string: 'Write At' });
      }
    }
    return defaultFields;
  }
  /**
   * Return Single Record for document
   * @param {object} record
   * @memberof Document
   */
  createRecord(data, options = {}) {
    return new Record(this, data, _.defaults(options, this.options));
  }
  /**
   * find and return single record
   * @param {id} id
   * @param {boolean} record
   */
  findById(id, record = true) {
    const self = this;
    if (!id) {
      return Promise.reject(new Error('id not defined'));
    }
    return this.findOne({ _id: MongoUtils.getObjectID(id) }).then(function (res) {
      if (record && !_.isEmpty(res)) {
        return self.createRecord(res);
      }
      return res;
    });
  }
  /**
   * find and return multiple record
   * @param {id} id
   * @param {boolean} record
   */
  findByIds(ids) {
    if (_.isEmpty(ids)) {
      return Promise.reject(new Error('ids not defined'));
    }
    return new Promise((res, rej) => {
      this.find({ _id: { $in: ids.map(id => MongoUtils.getObjectID(id)) } })
        .toArray(function (err, data) {
          if (err) {
            rej(err);
          } else {
            res(data);
          }
        });
    });
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
   * @returns field information
   * @memberof Document
   */
  getFieldsInfo() {
    const ClassName = this.fields.fieldClass;
    const ele = new ClassName(this.fields.props);
    ele.setFieldName(this.documentName);
    return ele.getFieldInfo().ele;
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
  /**
   * find documents
   * @param {object} domain
   * @param {object} options
   * @return {promise}
   */
  findToArray(domain, options) {
    return new Promise((res, rej) => {
      this.find(domain, options).toArray(function (err, data) {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      });
    });
  }
  /**
   * inserts a multiple document on collection.
   * @param {object} document
   * @param {object} options
   * @return {promise}
   */
  insertManyRecords(documents, options) {
    const self = this;
    const records = documents.map(doc => this.createRecord(doc));
    return new Promise((res, rej) => {
      Promise.all(records.map(rec => rec.validate())).then(function () {
        Promise.all(records.map(rec => rec._prepareSaveRecord())).then(function (docs) {
          self.insertMany(docs, options).then(res).catch(rej);
        }).catch(rej);
      }).catch(rej);
    });
  }
  /**
   * update multiple documents on collection.
   * call record setters before update record.
   * update timestep.
   *
   * @param {object} filter
   * @param {object} data
   * @param {object} options
   * @return {promise}
   */
  updateManyRecords(filter, data, options) {
    const rec = this.createRecord(data);
    return this.updateMany(filter, {
      $set: Object.assign(rec.toJson(), rec._getTimestamp()),
    }, options);
  }
}

module.exports = Document;
