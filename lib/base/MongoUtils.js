/**
 *   =====================================
 *       MongoORM Helper Functions
 *   =====================================
 */
const mongodb = require('mongodb');
const _isString = require('lodash/isString');

module.exports = {

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
        if (value && (typeof value === 'object' && !Array.isArray(value) && value._bsontype !== 'ObjectID')) {
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
    if (_isString(id)) {
      return new mongodb.ObjectID(id);
    }
    return id;
  },
};
