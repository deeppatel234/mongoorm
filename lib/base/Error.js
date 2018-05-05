
/**
 *   =====================================
 *       MongoORM Errors
 *   =====================================
 */

/**
 * Error for Document Name not defined in Document class
 */
class DocumentNotDefine extends Error {
  constructor(message) {
    super(message || 'Document Name Not Defined');
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message || 'Validation Error');
  }
}

class UnimplementedMethod extends Error {
  constructor(method) {
    super(method ? `${method} is not implemented` : 'Unimplemented Method Error');
  }
}

class RequiredProps extends Error {
  constructor(props) {
    super(`${props} is not defined`);
  }
}

module.exports = {
  DocumentNotDefine,
  RequiredProps,
  ValidationError,
  UnimplementedMethod,
};
