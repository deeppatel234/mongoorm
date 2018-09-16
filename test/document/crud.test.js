const mongoorm = require('../mongoorm');

const { Document } = mongoorm;

mongoorm.setLogger({
  info: console.info,
  error: console.error,
});

class User extends Document {
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
  initFields(fields) {
    return {
      firstname: fields.String(),
      lastname: fields.String(),
      middlename: fields.String({ uppercase: true }),
      address: {
        city: fields.String(),
        pin: fields.String(),
      },
    };
  }
}

class MyHooks extends Document {
  initFields(fields) {
    return {
      firstname: fields.String(),
      lastname: fields.String(),
    };
  }
}

this.userData = {
  firstname: 'Deep',
  lastname: 'Patel',
  address: {
    city: 'Mehsana',
    pin: '384002',
  },
};

beforeAll(async () => {
  await mongoorm.connect('mongodb://localhost:27017/mongoormtest');

  this.user = new User({ document: 'user' });
  this.record = this.user.create(this.userData);

  this.userWith = new UserWith({ document: 'user' });
  this.recordWith = this.userWith.create(this.userData);

  this.myHooks = new MyHooks({ document: 'user' });
});

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

describe('Many Insert and Update Operations', () => {
  test('Create Many record', async () => {
    expect.assertions(2);
    const data = await this.userWith.insertManyRecords([{
      middlename: 'a',
    }, {
      middlename: 'b',
    }, {
      middlename: 'b',
    }]);
    expect(data.ops.map(d => d.middlename)).toMatchObject(['A', 'B', 'B']);
    expect(data.insertedCount).toBe(3);
  });

  test('Update Many record', async () => {
    expect.assertions(2);
    const data = await this.userWith.updateManyRecords({ middlename: 'B' }, { middlename: 'c' });
    expect(data.modifiedCount).toBe(2);
    const findData = await this.userWith.findToArray({ middlename: 'C' });
    expect(findData.length).toBe(2);
  });
});

describe('Hooks Test', () => {
  describe('Hooks resolved', () => {
    test('pre, post hook when save record', async () => {
      expect.assertions(5);
      let seq = [];
      this.myHooks.preSave = jest.fn(function () {
        expect(this.firstname.get()).toBe('Deep');
        seq.push('preSave');
        return Promise.resolve();
      });
      this.myHooks.postSave = jest.fn(function () {
        expect(this.lastname.get()).toBe('Patel');
        seq.push('postSave');
        return Promise.resolve();
      });
      await this.myHooks.create(this.userData).save();
      expect(this.myHooks.preSave).toHaveBeenCalled();
      expect(this.myHooks.postSave).toHaveBeenCalled();
      expect(seq).toEqual(['preSave', 'postSave']);
    });

    test('pre, post hook when delete record', async () => {
      expect.assertions(5);
      let seq = [];
      this.myHooks.preDelete = jest.fn(function () {
        expect(this.firstname.get()).toBe('Deep');
        seq.push('preDelete');
        return Promise.resolve();
      });
      this.myHooks.postDelete = jest.fn(function () {
        expect(this.lastname.get()).toBe('Patel');
        seq.push('postDelete');
        return Promise.resolve();
      });
      await this.myHooks.create(this.userData).delete();
      expect(this.myHooks.preDelete).toHaveBeenCalled();
      expect(this.myHooks.postDelete).toHaveBeenCalled();
      expect(seq).toEqual(['preDelete', 'postDelete']);
    });
  });

  describe('Hooks rejected', () => {
    test('pre, post hook when save record', async () => {
      expect.assertions(4);
      let seq = [];
      this.myHooks.preSave = jest.fn(function () {
        expect(this.firstname.get()).toBe('Deep');
        seq.push('preSave');
        return Promise.reject(new Error('break pre save'));
      });
      this.myHooks.postSave = jest.fn(function () {
        seq.push('postSave');
        return Promise.resolve();
      });
      try {
        await this.myHooks.create(this.userData).save();
      } catch (e) {
        expect(e.message).toBe('break pre save');
      } finally {
        expect(this.myHooks.preSave).toHaveBeenCalled();
        expect(seq).toEqual(['preSave']);
      }
    });
  });
});


afterAll(async () => {
  await this.user.drop();
  await this.userWith.drop();
  await mongoorm.close(true);
});
