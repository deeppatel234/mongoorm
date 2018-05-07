/**
 *   =====================================
 *       MongoORM Exports Functions
 *   =====================================
 */
const logger = require('./lib/base/Logger');

exports.db = require('./db');

exports.setLogger = log => logger.setLogger(log);

exports.Fields = require('./lib/fields');
exports.Document = require('./lib/document/Document');
