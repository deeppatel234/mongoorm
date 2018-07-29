/**
 *   =====================================
 *       MongoORM Exports Functions
 *   =====================================
 */
const logger = require('./lib/base/Logger');
const connection = require('./Connection');
const mongodb = require('mongodb');
const mongoutils = require('./lib/base/MongoUtils');

exports.connect = (uri, options) => connection.connect(uri, options);
exports.close = force => connection.close(force);

exports.setLogger = log => logger.setLogger(log);
exports.ObjectId = mongodb.ObjectID;
exports.getObjectID = mongoutils.getObjectID;

exports.Fields = require('./lib/fields');
exports.Document = require('./lib/document/Document');
