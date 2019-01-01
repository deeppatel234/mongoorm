
/**
 *   =====================================
 *       MongoORM Errors
 *   =====================================
 */

/**
 * Error for Document Name not defined in Document class
 */
class DocumentNotDefine extends Error {
  constructor(message = 'Document Name Not Defined') {
    super(message);
  }
}

/**
 * Error for Document validation
 */
class ValidationError extends Error {
  constructor(message = 'Validation Error') {
    super(message);
  }
}

/**
 * Unimplemented Method Error
 */
class UnimplementedMethod extends Error {
  constructor(method) {
    super(method ? `${method} is not implemented` : 'Unimplemented Method Error');
  }
}

/**
 * Required Props Error
 */
class RequiredProps extends Error {
  constructor(props = 'NaN') {
    super(`${props} is not defined`);
  }
}

module.exports = {
  DocumentNotDefine,
  RequiredProps,
  ValidationError,
  UnimplementedMethod,
};
