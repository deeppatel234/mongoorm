/**
 * This is use for set default logger for MONGOORM.
 * User can use any logging framework.
 * Just assign error and info functions in MongoORM init
 */
class Logger {
  constructor() {
    this.error = () => {};
    this.info = () => {};
  }

  /**
   * Set Logger function
   *
   * @param {object} log
   */
  setLogger(log) {
    Object.assign(this, log);
  }
}

module.exports = new Logger();
