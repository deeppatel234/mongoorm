/**
 *   =====================================
 *       MongoDB Connection
 *   =====================================
*/

// External Libraries
const { MongoClient } = require('mongodb');
const _ = require('lodash');

// Internal Functions
const logger = require('./lib/base/Logger');
const mognoURI = require('./lib/base/MognoURI');
const config = require('./lib/base/Configuration');

class Connection {
  constructor() {
    this.client = null;
    this.connection = {};
  }
  /**
   * For Connect to MongoDB Instance
   *
   * @param {object} connection
   * @param {object} options
   * @memberof Connection
   */
  connect(uri, options) {
    options = this.scanOptions(options);
    if (this.client) {
      return new Promise(resolve => resolve());
    }
    uri = this.getURI(uri);
    let self = this;
    return new Promise((resolve, reject) => {
      MongoClient.connect(uri, options).then(function (client) {
        self.client = client;
        logger.info('MongoDB Connected at :', self.connection.hosts.map(h => h.host).join(), 'Database:', self.connection.database);
        resolve(client);
      }).catch(function (err) {
        logger.error(err);
        reject(err);
      });
    });
  }
  /**
   * close mongodb connection
   * @param {boolean} force
   * @memberof Connection
   */
  close(force = false) {
    if (this.client) {
      const self = this;
      return new Promise((resolve, reject) => {
        self.client.close(force).then(function () {
          logger.info('MongoDB Closing Connection');
          self.client = null;
          resolve(true);
        }).catch(function (err) {
          logger.info('MongoDB Closing Connection Error :', err);
          reject(err);
        });
      });
    }
  }
  /**
   * get mongodb client
   * @returns connection
   * @memberof Connection
   */
  get() {
    return this.client;
  }
  /**
   * get mongodb cursor for db operations
   * @returns connection
   * @memberof Connection
   */
  getDB() {
    return this.client.db();
  }
  /**
   * parse string from object
   * @param {string|object} uri
   * @memberof Connection
   */
  getURI(uri) {
    if (_.isObject(uri)) {
      this.connection = uri;
      return mognoURI.parseObject(uri);
    }
    this.connection = mognoURI.parseString(uri);
    return uri;
  }
  /**
   * scan options before connect to db
   * @param {object} options
   * @memberof Connection
   */
  scanOptions(options = {}) {
    if ('autoIndex' in options) {
      config.set('autoIndex', options.autoIndex);
      delete options.autoIndex;
    }
    return options;
  }
}

module.exports = new Connection();
