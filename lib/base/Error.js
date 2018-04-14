
/**
 *   =====================================
 *       MongoORM Errors
 *   =====================================
 */

/**
 * Error for Document Name not defined in Document class
 */
class DocumentNotDefine extends Error {
  constructor (message) {
    super(message || 'Document Name Not Defined')
  }
}

class ValidationError extends Error {
  constructor (message) {
    super(message || 'Validation Error')
  }
}

module.exports = {
  DocumentNotDefine,
  ValidationError
}
