const _isEmpty = require('lodash/isEmpty');

const NativeMethod = require('./Native');
const Schema = require('./Schema');
const { UnimplementedMethod } = require('../base/Error');
const Record = require('./Record');
const Fields = require('../fields');
const { getObjectID } = require('../base/MongoUtils');


/**
 *  Perform Operation in Document
 *
 */
class Document extends NativeMethod {
  constructor(options = {}) {
    super(options);
    this.schema = new Schema(this.initFields(Fields), options);

    // Initialize Custom Methods
    this.customMethods = {};
  }

  /**
   * =====================
   *    Public Methods
   * =====================
   */

  /**
   * Return Single Record for document
   *
   * @param {object} record
   * @memberof Document
   */
  createRecord(data) {
    return new Record(this, data);
  }

  /**
   * intialize fields
   * override from child class
   *
   * @param {object} fields
   * @memberof Document
   */
  initFields() {
    return {};
  }

  /**
   * @returns document name
   * @memberof Document
   */
  getDocumentName() {
    return UnimplementedMethod('getDocumentName');
  }

  /**
   * @returns fields information (type and name)
   * @memberof Document
   */
  getFieldsInfo() {
    return this.schema.getFieldsInfo();
  }


  /**
   * ===================
   * Document Methods
   * ===================
   */

  /**
   * find and return single record
   *
   * @param {string} id
   * @param {boolean} record
   */
  findById(id, record = true) {
    if (!id) {
      return Promise.reject(new Error('id not defined'));
    }
    return this.findOne({ _id: getObjectID(id) })
      .then(res => (record && !_isEmpty(res) ? this.createRecord(res) : res));
  }

  /**
   * find and return multiple record
   *
   * @param {list} ids
   */
  findByIds(ids) {
    if (_isEmpty(ids)) {
      return Promise.reject(new Error('ids not defined'));
    }
    return new Promise((res, rej) => {
      this.find({ _id: { $in: ids.map(id => getObjectID(id)) } })
        .toArray(function (err, data) {
          if (err) {
            rej(err);
          } else {
            res(data);
          }
        });
    });
  }
}

module.exports = Document;
