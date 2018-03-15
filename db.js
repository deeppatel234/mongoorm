/**
 *   =====================================
 *       MongoDB Connection
 *   =====================================
*/

// External Libraries
var MongoClient = require('mongodb').MongoClient

// Internal Functions
var logger = require('./lib/base/logger').getLogger()

// Init DB State
var state = { db: null }

/**
 * For Connect to MongoDB Instance
 *
 * @param {object} connection
 * @param {callback} cb
 */
exports.connect = function (connection, cb) {
  if (state.db) return cb()

  MongoClient.connect(connection.url, function (err, client) {
    if (err) return cb(err)
    state.db = client.db(connection.name)
    logger.info('MongoDB Connected at :', connection.url, 'Database:', connection.name)
    cb()
  })
}

/**
 * get mongodb cursor for db operations
 *
 */
exports.get = function () {
  return state.db
}

/**
 * close mongodb connection
 *
 * @param {callback} cb
 */
exports.close = function (cb) {
  if (state.db) {
    state.db.close(function (err, result) {
      if (err) {
        logger.info('MongoDB Closing Connection Error :', err)
        cb(err)
      }
      state.db = null
    })
  }
}
