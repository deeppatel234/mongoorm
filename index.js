/**
 *   =====================================
 *       MongoORM Exports Functions
 *   =====================================
 */
const logger = require('./lib/base/Logger');
const connection = require('./Connection');

exports.connect = (uri, options) => connection.connect(uri, options);
exports.close = force => connection.close(force);

exports.setLogger = log => logger.setLogger(log);

exports.Fields = require('./lib/fields');
exports.Document = require('./lib/document/Document');
