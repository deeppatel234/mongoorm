/**
 *   Used Official MongoDB Nodejs API
 *   Github: https://github.com/mongodb/node-mongodb-native
 *   API: http://mongodb.github.io/node-mongodb-native/3.0/api/
 */

/**
 * mongoutils Helper Class
 */
const connection = require('../../Connection');
const MongoError = require('../base/Error');
const Hooks = require('./Hooks');

/** Class representing mongodb native methods. */
class NativeMethods extends Hooks {
  /**
   * Get the mongodb collection cursor.
   * @return {object} db cursor.
   */
  getCollection() {
    if (!this.documentName) {
      throw new MongoError.DocumentNotDefine();
    }
    return connection.getDB().collection(this.documentName);
  }
  /**
   * Execute an aggregation framework pipeline against the collection, needs MongoDB >= 2.2
   * @param {object} pipeline
   * @param {object} options
   * @return {promise}
   */
  aggregate(pipeline, options) {
    return this.getCollection().aggregate(pipeline, options);
  }
  /**
   * Count number of matching documents in the db to a query.
   * @param {object} query
   * @param {object} options
   * @return {promise}
   */
  count(query, options) {
    return this.getCollection().count(query, options);
  }
  /**
   * Creates an index on the db and collection collection.
   * @param {object} fieldOrSpec
   * @param {object} options
   * @return {promise}
   */
  createIndex(fieldOrSpec, options) {
    return this.getCollection().createIndex(fieldOrSpec, options);
  }
  /**
   * delete single documents on collection.
   * @param {object} filter
   * @param {object} options
   * @return {promise}
   */
  deleteOne(filter, options) {
    return this.getCollection().deleteOne(filter, options);
  }
  /**
   * delete multiple documents on collection.
   * @param {object} document
   * @param {object} options
   * @return {promise}
   */
  deleteMany(filter, options) {
    return this.getCollection().deleteMany(filter, options);
  }
  /**
   * The distinct command returns returns a list of distinct values for
   * the given key across a collection
   * @param {string} key Field of the document to find distinct values for.
   * @param {object} query The query for filtering the set of documents
   * to which we apply the distinct filter.
   * @param {object} options
   * @return {promise}
   */
  distinct(key, query, options) {
    return this.getCollection().distinct(key, query, options);
  }
  /**
   *  Drops collection.
   *  @param {object} options
   *  @return {promise}
   */
  drop(options) {
    return this.getCollection().drop(options);
  }
  /**
   *  Drops an index from this collection.
   *  @param {string} indexName
   *  @param {object} options
   *  @return {promise}
   */
  dropIndex(indexName, options) {
    return this.getCollection().createIndex(indexName, options);
  }
  /**
   * Creates a cursor for a query that can be used to iterate over results from MongoDB
   * @param {object} domain
   * @param {object} options
   * @return {promise}
   */
  find(domain, options) {
    return this.getCollection().find(domain, options);
  }
  /**
   * Fetches the first document that matches the query
   * @param {object} domain
   * @param {object} options
   * @return {promise}
   */
  findOne(domain, options) {
    return this.getCollection().findOne(domain, options);
  }
  /**
   * inserts a single document on collection.
   * @param {object} document
   * @param {object} options
   * @return {promise}
   */
  insertOne(document, options) {
    if (!(document instanceof Object) && Array.isArray(document)) {
      return Promise.reject(new Error('data should be object'));
    }
    return this.getCollection().insertOne(document, options);
  }
  /**
   * inserts a multiple document on collection.
   * @param {object} document
   * @param {object} options
   * @return {promise}
   */
  insertMany(document, options) {
    if (!Array.isArray(document)) {
      return Promise.reject(new Error('data should be list of objects'));
    }
    return this.getCollection().insertMany(document, options);
  }
  /**
   * update a single document on collection.
   * @param {object} filter
   * @param {object} options
   * @return {promise}
   */
  updateOne(filter, update) {
    return this.getCollection().updateOne(filter, update);
  }
  /**
   * update multiple documents on collection.
   * @param {object} filter
   * @param {object} options
   * @return {promise}
   */
  updateMany(filter, update) {
    return this.getCollection().updateMany(filter, update);
  }
  /**
   * replace documents on collection.
   * @param {object} filter
   * @param {object} doc
   * @param {object} options
   * @return {promise}
   */
  replaceOne(filter, doc, options) {
    return this.getCollection().replaceOne(filter, doc, options);
  }
}

module.exports = NativeMethods;
