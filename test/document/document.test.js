const Document = require('../../lib/document');

class User extends Document {
  constructor(props) {
    super(props);

    this.customMethods = {
      capsName() {
        return this.name.get().toUpperCase();
      },
    };
  }

  initFields(fields) {
    return {
      name: fields.String(),
      age: fields.String({ required: true }),
      address: {
        city: fields.String(),
        pin: fields.String(),
        location: {
          latitude: fields.String(),
          longitude: fields.String(),
        },
      },
    };
  }
}

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

this.user = new User({ document: 'user', timestamps: false });
this.record = this.user.createRecord(this.data);

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
    expect(this.record.get()).toMatchObject(this.data);
  });


  test('validate function', async () => {
    await expect(this.record.validate()).resolves.toBe();
    this.record.age.set();
    await expect(this.record.validate()).rejects.toThrow('Undefined is required fields');
  });

  test('validateBefourSave option', async () => {
    this.record.age.set();
    this.record.schema.options.validateBefourSave = false;
    await expect(this.record.validate()).resolves.toBe();
    this.record.schema.options.validateBefourSave = true;
    await expect(this.record.validate()).rejects.toThrow('Undefined is required fields');
  });
});
