const _ = require('lodash')
const logger = require('../base/logger').getLogger()
const mongoutils = require('../base/mongoutils')

class Record {
  constructor (document, data, options) {
    this._record = {
      document,
      options,
      fields: Object.assign({}, document.fields)
    }
    this._initFieldsValue(this._record.fields, data)
    Object.assign(this, this._record.fields)
    Object.assign(this, document.customFunctions)
  }

  /***************************************
              Private Methods
  ***************************************/

  /**
   * add timestamps before update/save
   * @param {any} data
   * @param {any} mode
   * @returns data
   * @memberof Record
   */
  _appendTimestamp (data, mode) {
    let ts = this._record.document.timestampFields
    if (ts) {
      let time = this[ts.createAt].getCurrentDateTime()
      if (mode === 'save' && ts.createAt) {
        data[ts.createAt] = time
      }
      if (ts.writeAt) {
        data[ts.writeAt] = time
      }
    }
    return data
  }
  /**
   * extract data from all the fields and store in data param
   * @param {object} fields
   * @param {object} data
   * @memberof Record
   */
  _getData (fields, data, func) {
    let keys = Object.keys(fields)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (fields[key].isFieldObject) {
        let value = fields[key].get()
        if (func(value, fields[key])) {
          data[key] = value
        }
      } else {
        if (_.isUndefined(data[key])) {
          data[key] = {}
        }
        this._getData(fields[key], data[key], func)
        if (_.isEmpty(data[key])) {
          delete data[key]
        }
      }
    }
  }
  /**
   * filter fields from current object
   * @memberof Record
   */
  _getFields () {
    return _.pickBy(_.omit(this, ['_record']), (val) => !_.isFunction(val))
  }
  /**
   * extract data from all the fields
   * mode: modified return only modified data
   * @param {string} mode
   * @memberof Record
   */
  _getFieldsValue (mode, id = true, timestamp = true) {
    let data = {}
    let fields = this._getFields()
    let func = () => true
    if (mode === 'all') {
      func = (value, field) => !_.isUndefined(value)
    }
    if (mode === 'modified') {
      func = (value, field) => !_.isUndefined(value) && field.markModified
    }
    this._getData(fields, data, func)
    if (!id) {
      data = _.omit(data, ['_id'])
    }
    if (!timestamp) {
      let tsf = Object.values(this._record.document.timestampFields)
      data = _.omit(data, tsf)
    }
    return data
  }
  /**
   * return record id
   * @memberof Record
   */
  _getId () {
    return this._id.get()
  }
  /**
   * set values to all related fields
   * @param {object} fields
   * @param {object} data
   * @memberof Record
   */
  _initFieldsValue (fields, data) {
    let keys = Object.keys(fields)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      let value = data[key]
      if (fields[key].isFieldObject && value) {
        fields[key].initValue(value)
      } else {
        if (value) {
          this._initFieldsValue(fields[key], value)
        }
      }
    }
  }
  /**
   * mark and un-mark modified fields when save/update operation
   * @param {any} fields
   * @param {any} value
   * @memberof Record
   */
  _markModified (fields, value) {
    let keys = Object.keys(fields)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (fields[key].isFieldObject) {
        fields[key].markModified = value
      } else {
        this._markModified(fields[key], value)
      }
    }
  }
  /**
   * Save Single Record in Database
   * @returns promises
   * @memberof Record
   */
  _saveRecord () {
    let self = this
    let validate = this._validate()
    if (validate.isValid) {
      let data = self._getFieldsValue('all', false, false)
      if (_.isEmpty(data)) {
        return new Promise((resolve, reject) => resolve(true))
      }
      data = self._appendTimestamp(data, 'save')
      return new Promise((resolve, reject) => {
        self._record.document.insertOne(data, function (err, result) {
          if (err) {
            logger.error(err)
            reject(err)
          } else {
            self._triggerSaved(data)
            self._id.set(result.insertedId)
            resolve(result)
          }
        })
      })
    } else {
      return mongoutils.asyncError(validate.errorMessage)
    }
  }
  /**
   * update record in Database
   * @returns promises
   * @memberof Record
   */
  _update () {
    var self = this
    let validate = this._validate()
    if (validate.isValid) {
      let data = this._getFieldsValue('modified', false, false)
      if (_.isEmpty(data)) {
        return new Promise((resolve, reject) => resolve(true))
      }
      data = mongoutils.obj2dot(self._appendTimestamp(data))
      return this._record.document.updateOne({ _id: this._getId() }, { $set: data }).then(function (err, result) {
        if (!err) {
          self._triggerSaved(data)
        }
      })
    } else {
      return mongoutils.asyncError(validate.errorMessage)
    }
  }
  /**
   * reset states of record use in copy record
   * @memberof Record
   */
  _resetStates () {
    this._id.set()
    this._record.saved = false
  }
  /**
   * validate data
   * @returns boolean
   * @memberof Record
   */
  _validate () {
    return this._record.document.validateData(this._getFields())
  }
  /**
   * update timestamps value after data save/update in database
   * @param {any} data
   * @memberof Record
   */
  _updateTimestamps (data) {
    let ts = this._record.document.timestampFields
    if (ts) {
      if (data[ts.createAt]) {
        this[ts.createAt].set(data[ts.createAt])
      }
      if (data[ts.writeAt]) {
        this[ts.writeAt].set(data[ts.writeAt])
      }
    }
  }
  /**
   * update data if db operation successfully completed
   * @memberof Record
   */
  _triggerSaved (data) {
    this._updateTimestamps(data)
    this._markModified(this._getFields(), false)
  }

  /***************************************
              Public Methods
  ***************************************/

  /**
   * copy record without id
   * @returns record
   * @memberof Record
   */
  copy () {
    let copyObject = _.cloneDeep(this)
    copyObject._resetStates()
    return copyObject
  }
  /**
   * delete record in Database
   * @returns promises
   * @memberof Record
   */
  delete () {
    return this._record.document.deleteOne({ _id: this._getId() })
  }
  /**
   * save Single Record in Database
   * @returns promises
   * @memberof Record
   */
  save () {
    if (this._getId()) {
      return this._update()
    } else {
      return this._saveRecord()
    }
  }
  /**
   * return data in json format
   * @returns obj
   * @memberof Record
   */
  toJson () {
    return this._getFieldsValue('all')
  }
}

module.exports = Record
