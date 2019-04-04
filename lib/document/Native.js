/**
 *   Used Official MongoDB Nodejs API
 *   Github: https://github.com/mongodb/node-mongodb-native
 *   API: http://mongodb.github.io/node-mongodb-native/3.0/api/
 */

/**
 * mongoutils Helper Class
 */
const connection = require('../../Connection');
const { DocumentNotDefine } = require('../base/Error');
const Hooks = require('./Hooks');

/** Class representing mongodb native methods. */
class NativeMethods extends Hooks {
  constructor(options) {
    super();
    this.documentName = options.document || this.getDocumentName();
    if (!this.documentName) {
      throw new DocumentNotDefine();
    }
    this.__asignMethods();
  }

  __asignMethods() {
    this.nativeCollectionMethods().forEach((method) => {
      this[method] = (...args) => connection.getCollection(this.documentName)[method](...args);
    });
  }

  getDocumentName() {
    return '';
  }

  nativeCollectionMethods() {
    return [
      'aggregate',
      'bulkWrite',
      'count',
      'createIndex',
      'createIndexes',
      'deleteOne',
      'deleteMany',
      'distinct',
      'drop',
      'dropIndex',
      'dropIndexes',
      'find',
      'findOne',
      'findOneAndDelete',
      'findOneAndReplace',
      'geoHaystackSearch',
      'indexes',
      'indexExists',
      'indexInformation',
      'initializeOrderedBulkOp',
      'initializeUnorderedBulkOp',
      'insertMany',
      'insertOne',
      'isCapped',
      'listIndexes',
      'mapReduce',
      'options',
      'parallelCollectionScan',
      'reIndex',
      'rename',
      'replaceOne',
      'stats',
      'updateMany',
      'updateOne',
      'watch',
    ];
  }
}

module.exports = NativeMethods;
