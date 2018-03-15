/**
 *   =====================================
 *       MongoORM Helper Functions
 *   =====================================
 */

module.exports = {
  asyncError: (msg) => new Promise((resolve, reject) => reject(msg))
}
