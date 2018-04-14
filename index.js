/**
 *   =====================================
 *       MongoORM Exports Functions
 *   =====================================
 */

exports.db = require('./db')
exports.setLogger = require('./lib/base/logger').setLogger

exports.Fields = require('./lib/fields')
exports.Document = require('./lib/document/Document')
