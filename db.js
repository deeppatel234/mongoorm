/**
 *   =====================================
 *       MongoDB Connection
 *   =====================================
*/

// External Libraries
const { MongoClient } = require('mongodb');

// Internal Functions
const logger = require('./lib/base/logger').getLogger();

class Connection {
  constructor() {
    this.db = null;
    this.client = null;
  }
  /**
   * For Connect to MongoDB Instance
   *
   * @param {object} connection
   * @param {object} options
   * @memberof Connection
   */
  connect(connection, options = {}) {
    if (this.db) {
      return new Promise(resolve => resolve());
    }
    const self = this;
    return new Promise((resolve, reject) => {
      MongoClient.connect(connection.url, options).then(function (client) {
        self.client = client;
        self.db = client.db(connection.name);
        logger.info('MongoDB Connected at :', connection.url, 'Database:', connection.name);
        resolve(client);
      }).catch(function (err) {
        logger.error(err);
        reject(err);
      });
    });
  }
  /**
   * get mongodb cursor for db operations
   * @returns connection
   * @memberof Connection
   */
  get() {
    return this.db;
  }
  /**
   * close mongodb connection
   * @param {boolean} force
   * @memberof Connection
   */
  close(force = false) {
    if (this.db) {
      const self = this;
      return new Promise((resolve, reject) => {
        self.client.close(force).then(function () {
          logger.info('MongoDB Closing Connection');
          self.db = null;
          self.client = null;
          resolve(true);
        }).catch(function (err) {
          logger.info('MongoDB Closing Connection Error :', err);
          reject(err);
        });
      });
    }
  }
}

module.exports = new Connection();
