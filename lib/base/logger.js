/**
 * This is use for set default logger for MONGOORM.
 * User can use any logging framework.
 * Just assign error and info functions in MongoORM init
 */
this.logger = {
  error: () => {},
  info: () => {}
}

/**
 * Set Logger function
 *
 * @param {object} log
 */
exports.setLogger = (log) => { Object.assign(this.logger, log) }

/**
 * use in mongoorm internal logging
 * get Logger functions
 */
exports.getLogger = () => this.logger
