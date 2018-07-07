const Record = require('../../lib/document/Record');
const Fields = require('../../lib/fields');

beforeAll(() => {
  this.documents = {
    fields: Fields.Object({
      ele: {
        _id: Fields.ObjectId(),
        name: Fields.String(),
        age: Fields.String({ required: true }),
        address: {
          city: Fields.String(),
          pin: Fields.String(),
          location: {
            latitude: Fields.String(),
            longitude: Fields.String(),
          },
        },
        create_at: Fields.DateTime({ default: 'now' }),
        write_at: Fields.DateTime({ default: 'now' }),
      },
    }),
    customFunctions: {
      capsName() {
        return this.name.get().toUpperCase();
      },
    },
    timestamps: {
      createAt: 'create_at',
      writeAt: 'write_at',
    },
  };


  this.data = {
    _id: 1,
    name: 'deep',
    age: '21',
    address: {
      city: 'Mehsana',
      pin: '384002',
      location: {
        latitude: '1234',
        longitude: '5678',
      },
    },
  };
  this.record = new Record(this.documents, this.data, { validateBefourSave: true });
});

describe('Document Record', () => {
  test('init fields data when creating record', () => {
    expect(this.record.name.get()).toBe('deep');
    expect(this.record.address.city.get()).toBe('Mehsana');
    expect(this.record.address.location.latitude.get()).toBe('1234');
  });

  test('custom functions', () => {
    expect(this.record.capsName()).toBe('DEEP');
  });

  test('tojson function', () => {
    expect(this.record.toJson()).toMatchObject(this.data);
  });

  describe('timestamps function', () => {
    test('get timestamps when save data', () => {
      expect(Object.keys(this.record._getTimestamp('save'))).toMatchObject(['create_at', 'write_at']);
    });

    test('get timestamps when update data', () => {
      expect(Object.keys(this.record._getTimestamp())).toMatchObject(['write_at']);
    });

    test('update timestamps when update/save data', () => {
      let timestamps = this.record._getTimestamp('save');
      this.record._updateTimestamps(timestamps);
      expect(this.record.create_at.get()).toBe(timestamps.create_at);
      expect(this.record.write_at.get()).toBe(timestamps.write_at);
    });
  });

  describe('getFieldsValue function', () => {
    test('getFieldsValue all mode', () => {
      expect(Object.keys(this.record._getFieldsValue({ mode: 'all' }))).toMatchObject(['_id', 'name', 'age', 'address', 'create_at', 'write_at']);
    });

    test('getFieldsValue save mode', () => {
      expect(Object.keys(this.record._getFieldsValue({ id: false, timestamp: false }))).toMatchObject(['name', 'age', 'address']);
    });

    test('getFieldsValue modified mode', () => {
      this.record._triggerSaved({});
      expect(Object.keys(this.record._getFieldsValue({ mode: 'modified', id: false, timestamp: false }))).toHaveLength(0);
      this.record.name.set('hello');
      expect(Object.keys(this.record._getFieldsValue({ mode: 'modified', id: false, timestamp: false }))).toHaveLength(1);
      expect(this.record._getFieldsValue({ mode: 'modified', id: false, timestamp: false })).toMatchObject({ name: 'hello' });
    });
  });

  test('validate function', async () => {
    await expect(this.record.validate()).resolves.toBe();
    this.record.age.set();
    await expect(this.record.validate()).rejects.toThrow(':: age is required fields');
  });

  test('validateBefourSave option', async () => {
    this.record.age.set();
    this.record.options.validateBefourSave = false;
    await expect(this.record.validate()).resolves.toBe();
    this.record.options.validateBefourSave = true;
    await expect(this.record.validate()).rejects.toThrow(':: age is required fields');
  });
});
