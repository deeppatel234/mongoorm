const _defaults = require('lodash/defaults');

const Fields = require('../fields');
const { getCurrentDateTime } = require('../base/MongoUtils');

class Schema {
  constructor(fields, options) {
    this.options = _defaults(options, this.getDefaultOptions());
    this.fields = this.prepareFields(fields);
  }

  /**
   * =====================
   *    Public Methods
   * =====================
   */

  /**
   * create field instance
   *
   * @memberof Schema
   */
  initRecord() {
    const ClassName = this.fields.fieldClass;
    const record = new ClassName(this.fields.props);
    record.setKey('root');
    return record;
  }

  /**
   * Return default options for document
   *
   * @memberof Schema
   */
  getDefaultOptions() {
    return {
      validateBefourSave: true,
      timestamps: {
        createAt: 'createAt',
        writeAt: 'writeAt',
      },
    };
  }

  /**
   * @returns field information
   * @memberof Schema
   */
  getFieldsInfo() {
    const ele = this.initRecord();
    ele.setKey('root');
    return ele.getFieldInfo().ele;
  }

  /**
   * add timestamps before update/save
   *
   * @param {any} mode
   * @returns data
   * @memberof Schema
   */
  getTimestamp(mode) {
    const { timestamps } = this.options;
    const data = {};
    if (timestamps) {
      const time = getCurrentDateTime();
      if (mode === 'save' && timestamps.createAt) {
        data[timestamps.createAt] = time;
      }
      if (timestamps.writeAt) {
        data[timestamps.writeAt] = time;
      }
    }
    return data;
  }

  getTimestampFields() {
    return this.options.timestamp;
  }

  /**
   * prepare fields
   *
   * @param {object} fields
   * @memberof Schema
   */
  prepareFields(fields) {
    const { timestamps } = this.options;
    const defaultFields = {
      _id: Fields.ObjectId({ string: 'ID' }),
    };

    if (timestamps) {
      if (timestamps.createAt) {
        defaultFields[timestamps.createAt] = Fields.DateTime({ string: 'Create At' });
      }
      if (timestamps.writeAt) {
        defaultFields[timestamps.writeAt] = Fields.DateTime({ string: 'Write At' });
      }
    }

    fields = { ...defaultFields, ...fields };
    Fields.FieldUtils.prepareFieldsRec(fields);
    return Fields.Object({ ele: fields });
  }
}

module.exports = Schema;
