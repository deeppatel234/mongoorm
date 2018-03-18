const _ = require('lodash')

class AbstractFields {
  constructor (props) {
    this.props = Object.assign(this.getDefaultProps(), props)
    this.errorMessages = []

    this.initValidator()
    this.initSetter()
  }
  /**
   * return default props
   */
  getDefaultProps () {
    return {}
  }
  /**
   * return error message added when validate value
   * replace {KEY} with name of field
   * @param {string} key
   * @returns {list} list of error messages
   */
  getErrorMessage (key) {
    return this.errorMessages.map((error) => error.replace('{KEY}', key))
  }
  /**
   * use this for get default message if message is not define in validator
   * @param {string} message
   * @param {string} prop
   */
  getDefaultMessage (message, prop) {
    return message || `${prop} is not validate in {KEY}`
  }
  /**
   * set error message
   * @param {string} message
   */
  setErrorMessage (message) {
    return this.errorMessages.push(message)
  }

  // ==============
  // Get Value
  // ==============
  /**
  * @return {type} value
  */
  getValue () {
    if (this.props.default && !this._value) {
      return this.getDefaultValue(this.props.default)
    }
    return this._value
  }
  /**
   * compute default value
   * @returns {type} default value
   */
  getDefaultValue (propValue) {
    if (_.isFunction(propValue)) {
      return propValue()
    }
    return propValue
  }

  // ==============
  // Set Value
  // ==============
  /**
   * initialize setter
   */
  initSetter () {
    this.setAttrs = []
  }
  /**
   * set custom setter
   *
   * @param {obj} setter
   * setter has 3 properties
   *  prop : name of props
   *  func : validator function take propsValue as argument return new computed value
   *  sequence : sequence that validate functions
   */
  setSetter (setter) {
    if (Array.isArray(setter)) {
      this.setAttrs.push(...setter)
    } else {
      this.setAttrs.push(setter)
    }
  }
  /**
  * @param {type} value
  */
  setValue (value) {
    this._value = value
    this.setValueByProps()
  }
  /**
  * convert value to props type
  * EX: lowercase = true them convert value to lowercase
  * @param {type} value
  */
  setValueByProps () {
    // Sort validator by sequence
    _.sortBy(this.setAttrs, ['sequence'])

    this.setAttrs.forEach(attr => {
      if (attr.prop in this.props) {
        this._value = attr.func.call(this, this.props[attr.prop], this.getValue())
      }
    })
  }

  // ==============
  // Validator
  // ==============
  /**
   * initialize validator
   */
  initValidator () {
    this.validateAttrs = []
  }
  /**
   * set custom validator
   *
   * @param {obj} validator
   * validator has 3 properties
   *  prop : name of props
   *  func : validator function take propsValue as argument return true/false
   *  sequence : sequence that validate functions
   */
  setValidator (validator) {
    if (Array.isArray(validator)) {
      this.validateAttrs.push(...validator)
    } else {
      this.validateAttrs.push(validator)
    }
  }
  /**
   * validate fields
   * first check type of field then it check other props
   * @returns {boolean} is Valid or not
   */
  validate () {
    this.errorMessages = []
    let value = this.getValue()

    // First Check field is required or not
    if (!this.validateRequired(this.props.required, value)) {
      this.errorMessages.push(`{KEY} is required fields`)
      return false
    }

    // if not required and value not set then not validate validator
    if (!value) {
      return true
    }

    // validate type of field before validate props
    if (!this.validateType(value)) {
      this.errorMessages.push(`{KEY} is not ${this.type} type`)
      return false
    }

    // validate validator
    return this.validateProps(value)
  }
  /**
   * validate props of fields like required etc
   * @returns {boolean} props are valid or not
   */
  validateProps (value) {
    // Sort validator by sequence before validations
    _.sortBy(this.validateAttrs, 'sequence')

    let isValid = true
    let self = this
    _.forEach(this.validateAttrs, function (attr) {
      if (attr.prop in self.props) {
        isValid = attr.func.call(self, self.props[attr.prop], value)
        if (!isValid) {
          self.setErrorMessage(self.getDefaultMessage(attr.message, attr.prop).replace('{VAL}', self.props[attr.prop]))
          return false
        }
      }
    })

    if (isValid) {
      this.errorMessages = []
    }
    return isValid
  }
  /**
   * validate type of field
   * override in child field class
   * @returns {boolean}
   */
  validateType (value) {
    return false
  }

  // ==========================
  // Validator Functions
  // ==========================

  /**
   * check field is required or not
   * { required : true/false }
   * @param {boolean} propValue
   */
  validateRequired (propValue, value) {
    return !propValue || !!value
  }
}

module.exports = AbstractFields
