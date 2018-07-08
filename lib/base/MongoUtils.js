/**
 *   =====================================
 *       MongoORM Helper Functions
 *   =====================================
 */
const mongodb = require('mongodb');
const _ = require('lodash');

module.exports = {

  /**
   * extend object if condtion is true
   *
   * @param {object} object
   * @param {object} source
   * @param {boolean} condition
   */
  extend(object, source, condition = true) {
    if (condition) {
      Object.assign(object, source);
    }
  },
  /**
   * Convert object to dot notation object
   * EX:
   * obj = { a: 1, b: {c:1} }
   * return { a:1 , b.c: 1 }
   */
  obj2dot(obj) {
    const res = {};
    function recurse(dotobj, current) {
      const keys = Object.keys(dotobj);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const value = dotobj[key];
        const newKey = (current ? `${current}.${key}` : key); // joined key with dot
        if (value && typeof value === 'object') {
          recurse(value, newKey); // it's a nested object, so do it again
        } else {
          res[newKey] = value; // it's not an object, so set the property
        }
      }
    }
    recurse(obj);
    return res;
  },
  /*
   * @returns current utc date and time
   */
  getCurrentDateTime() {
    return new Date().toUTCString();
  },
  /*
   * @returns current utc date
   */
  getCurrentDate() {
    let date = new Date();
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  },
  /*
   * @returns objectid
   */
  getObjectID(id) {
    if (_.isString(id)) {
      return new mongodb.ObjectID(id);
    }
    return id;
  },
};
