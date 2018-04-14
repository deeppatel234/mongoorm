/**
 *   =====================================
 *       MongoORM Helper Functions
 *   =====================================
 */

module.exports = {

  /**
   * Async Error for rejecting promises
   */
  asyncError: (msg) => new Promise((resolve, reject) => reject(msg)),

  /**
   * Convert object to dot notation object
   * EX:
   * obj = { a: 1, b: {c:1} }
   * return { a:1 , b.c: 1 }
   */
  obj2dot: function (obj) {
    let res = {}
    function recurse (obj, current) {
      for (let key in obj) {
        let value = obj[key]
        let newKey = (current ? current + '.' + key : key) // joined key with dot
        if (value && typeof value === 'object') {
          recurse(value, newKey) // it's a nested object, so do it again
        } else {
          res[newKey] = value // it's not an object, so set the property
        }
      }
    }
    recurse(obj)
    return res
  }
}
