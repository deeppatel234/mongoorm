const mongoorm = require('../mongoorm');

const { Document } = mongoorm;

const mlabdbConfig = {
  url: 'mongodb://test:test123@ds113648.mlab.com:13648/mongoormtest',
  name: 'mongoormtest',
};

const localdbConfig = {
  url: 'mongodb://localhost:27017',
  name: 'mongoormtest',
};

let dbConfig = process.env.NODE_ENV === 'local' ? localdbConfig : mlabdbConfig;

beforeAll(async () => {
  await mongoorm.db.connect(dbConfig);
});

class User extends Document {
  constructor() {
    super();
    this.documentName = 'user';
  }

  getTimestampFields() {
    return false;
  }

  initFields(fields) {
    return {
      firstname: fields.String(),
      lastname: fields.String(),
      address: {
        city: fields.String(),
        pin: fields.String(),
      },
    };
  }
}

class UserWith extends Document {
  constructor() {
    super();
    this.documentName = 'user';
    this.timestampFields = false;
  }

  initFields(fields) {
    return {
      firstname: fields.String(),
      lastname: fields.String(),
      address: {
        city: fields.String(),
        pin: fields.String(),
      },
    };
  }
}

this.user = new User();
this.userWith = new UserWith();

this.userData = {
  firstname: 'Deep',
  lastname: 'Patel',
  address: {
    city: 'Mehsana',
    pin: '384002',
  },
};
this.record = this.user.create(this.userData);
this.recordWith = this.userWith.create(this.userData);

describe('CRUD Operations Without Timestamps', () => {
  test('Create record', async () => {
    expect.assertions(4);
    await this.record.save();
    expect(!!this.record._id.get()).toBe(true);
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(this.record.toJson()).toMatchObject(userDBData);
    expect(this.record.create_at).toBeUndefined();
    expect(this.record.write_at).toBeUndefined();
  });

  test('Update record', async () => {
    expect.assertions(3);
    this.record.firstname.set('hello');
    await this.record.save();
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(this.record.toJson()).toMatchObject(userDBData);
    expect(this.record.create_at).toBeUndefined();
    expect(this.record.write_at).toBeUndefined();
  });

  test('Complex Update record', async () => {
    expect.assertions(3);
    this.record.address.city.set('Gandhinagar');
    await this.record.save();
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(this.record.toJson()).toMatchObject(userDBData);
    expect(this.record.create_at).toBeUndefined();
    expect(this.record.write_at).toBeUndefined();
  });

  test('Delete record', async () => {
    expect.assertions(1);
    await this.record.delete();
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(userDBData).toBe(null);
  });
});

describe('CRUD Operations With Timestamps', () => {
  test('Create record', async () => {
    expect.assertions(4);
    await this.recordWith.save();
    expect(!!this.recordWith._id.get()).toBe(true);
    let userDBData = await this.userWith.findOne({ _id: this.recordWith._id.get() });
    expect(this.recordWith.toJson()).toMatchObject(userDBData);
    expect(this.recordWith.create_at.get()).toBe(userDBData.create_at);
    expect(this.recordWith.write_at.get()).toBe(userDBData.write_at);
  });

  test('Update record', async () => {
    expect.assertions(3);
    this.recordWith.firstname.set('hello');
    await this.recordWith.save();
    let userDBData = await this.userWith.findOne({ _id: this.recordWith._id.get() });
    expect(this.recordWith.toJson()).toMatchObject(userDBData);
    expect(this.recordWith.create_at.get()).toBe(userDBData.create_at);
    expect(this.recordWith.write_at.get()).toBe(userDBData.write_at);
  });

  test('Complex Update record', async () => {
    expect.assertions(3);
    this.recordWith.address.city.set('Gandhinagar');
    await this.recordWith.save();
    let userDBData = await this.userWith.findOne({ _id: this.recordWith._id.get() });
    expect(this.recordWith.toJson()).toMatchObject(userDBData);
    expect(this.recordWith.create_at.get()).toBe(userDBData.create_at);
    expect(this.recordWith.write_at.get()).toBe(userDBData.write_at);
  });
});

afterAll(async () => {
  await this.user.drop();
  await mongoorm.db.close();
});