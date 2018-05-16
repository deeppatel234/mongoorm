/**
 * Store Globle Configuration
 *
 * @class Configuration
 */
class Configuration {
  constructor() {
    this.conf = {};
  }
  /**
   * get config return default value if not defined
   *
   * @param {any} prop
   * @param {any} defaultValue
   * @returns prop
   * @memberof Configuration
   */
  get(prop, defaultValue) {
    return prop in this.conf ? this.conf[prop] : defaultValue;
  }
  /**
   * set config
   *
   * @param {string} prop
   * @param {any} value
   * @memberof Configuration
   */
  set(prop, value) {
    this.conf[prop] = value;
  }
}

module.exports = new Configuration();
