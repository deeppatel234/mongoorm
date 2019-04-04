/**
 *   =====================================
 *       MongoDB Connection
 *   =====================================
*/

// External Libraries
const { MongoClient } = require('mongodb');
const _isObject = require('lodash/isObject');

// Internal Functions
const logger = require('./lib/base/Logger');
const mognoURI = require('./lib/base/MognoURI');
const config = require('./lib/base/Configuration');


const CONFIG_OPTIONS = ['autoIndex'];

class Connection {
  constructor() {
    this.client = null;
    this.connectionObj = {};
  }

  /**
   * For Connect to MongoDB Instance
   *
   * @param {object} connection
   * @param {object} options
   * @memberof Connection
   */
  connect(uri, options) {
    if (!uri) {
      throw new Error('MongoDB URI Not Defined');
    }

    // filter global config
    options = this.scanOptions(options);

    if (this.client) {
      return Promise.resolve();
    }

    this.connectionObj = _isObject(uri) ? uri : mognoURI.parseString(uri);
    uri = _isObject(uri) ? mognoURI.parseObject(uri) : uri;

    return new Promise((resolve, reject) => {
      MongoClient.connect(uri, options).then((client) => {
        this.client = client;
        logger.info('MongoDB Connected at:', this.connectionObj.hosts.map(h => h.host).join(), ' Database:', this.connectionObj.database);
        resolve(client);
      }).catch((err) => {
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
    if (!this.client) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.client.close(force).then(() => {
        logger.info('MongoDB Closing Connection');
        this.client = null;
        resolve(true);
      }).catch((err) => {
        logger.info('MongoDB Closing Connection Error :', err);
        reject(err);
      });
    });
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
   * get document cursor for db operations
   * @returns connection
   * @memberof Connection
   */
  getCollection(name) {
    return this.client.db().collection(name);
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
   * scan options before connect to db
   *
   * @param {object} options
   * @memberof Connection
   */
  scanOptions(options = {}) {
    Object.keys(options).forEach((key) => {
      if (CONFIG_OPTIONS.includes(key)) {
        config.set(key, options[key]);
        delete options[key];
      }
    });
    return options;
  }
}

module.exports = new Connection();
