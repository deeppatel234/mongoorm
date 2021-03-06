const mongoorm = require('../mongoorm');

const { Document } = mongoorm;

mongoorm.setLogger({
  info: console.info,
  error: console.error,
});


class User extends Document {
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

class Employee extends Document {
  initFields(fields) {
    return {
      firstname: fields.String({ string: 'First Name' }),
      lastname: fields.String({ string: 'Last Name' }),
      address: fields.Array({
        string: 'Address',
        ele: {
          city: fields.String({ string: 'City' }),
          pin: fields.String({ string: 'Pin Code' }),
        },
      }),
      birthinfo: {
        date: fields.DateTime({ string: 'Date of Birth' }),
      },
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

  this.user = new User({ document: 'user', timestamps: false });
  this.employee = new Employee({ document: 'employee' });
  this.record = this.user.createRecord(this.userData);

  this.userWith = new UserWith({ document: 'user' });
  this.recordWith = this.userWith.createRecord(this.userData);

  this.myHooks = new MyHooks({ document: 'user' });
});

test('Field Info Test', async () => {
  expect.assertions(1);
  const fieldInfo = this.employee.getFieldsInfo();
  expect(fieldInfo).toMatchObject({
    _id: {
      name: '_id',
      string: 'ID',
      type: 'objectid',
    },
    address: {
      ele: {
        ele: {
          city: {
            name: 'city',
            string: 'City',
            type: 'string',
          },
          pin: {
            name: 'pin',
            string: 'Pin Code',
            type: 'string',
          },
        },
        name: 'address',
        string: 'address',
        type: 'object',
      },
      name: 'address',
      string: 'Address',
      type: 'array',
    },
    birthinfo: {
      ele: {
        date: {
          name: 'date',
          string: 'Date of Birth',
          type: 'datetime',
        },
      },
      name: 'birthinfo',
      string: 'birthinfo',
      type: 'object',
    },
    createAt: {
      name: 'createAt',
      string: 'Create At',
      type: 'datetime',
    },
    firstname: {
      name: 'firstname',
      string: 'First Name',
      type: 'string',
    },
    lastname: {
      name: 'lastname',
      string: 'Last Name',
      type: 'string',
    },
    writeAt: {
      name: 'writeAt',
      string: 'Write At',
      type: 'datetime',
    },
  });
});

describe('CRUD Operations Without Timestamps', () => {
  test('Create record', async () => {
    expect.assertions(4);
    await this.record.save();
    expect(!!this.record._id.get()).toBe(true);
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(this.record.get()).toMatchObject(userDBData);
    expect(this.record.createAt).toBeUndefined();
    expect(this.record.writeAt).toBeUndefined();
  });

  test('Update record', async () => {
    expect.assertions(3);
    this.record.firstname.set('hello');
    await this.record.save();
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(this.record.get()).toMatchObject(userDBData);
    expect(this.record.createAt).toBeUndefined();
    expect(this.record.writeAt).toBeUndefined();
  });

  test('Complex Update record', async () => {
    expect.assertions(3);
    this.record.address.city.set('Gandhinagar');
    await this.record.save();
    let userDBData = await this.user.findOne({ _id: this.record._id.get() });
    expect(this.record.get()).toMatchObject(userDBData);
    expect(this.record.createAt).toBeUndefined();
    expect(this.record.writeAt).toBeUndefined();
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
    expect(this.recordWith.get()).toMatchObject(userDBData);
    expect(this.recordWith.createAt.get()).toBe(userDBData.createAt);
    expect(this.recordWith.writeAt.get()).toBe(userDBData.writeAt);
  });

  test('Update record', async () => {
    expect.assertions(3);
    this.recordWith.firstname.set('hello');
    await this.recordWith.save();
    let userDBData = await this.userWith.findOne({ _id: this.recordWith._id.get() });
    expect(this.recordWith.get()).toMatchObject(userDBData);
    expect(this.recordWith.createAt.get()).toBe(userDBData.createAt);
    expect(this.recordWith.writeAt.get()).toBe(userDBData.writeAt);
  });

  test('Complex Update record', async () => {
    expect.assertions(3);
    this.recordWith.address.city.set('Gandhinagar');
    await this.recordWith.save();
    let userDBData = await this.userWith.findOne({ _id: this.recordWith._id.get() });
    expect(this.recordWith.get()).toMatchObject(userDBData);
    expect(this.recordWith.createAt.get()).toBe(userDBData.createAt);
    expect(this.recordWith.writeAt.get()).toBe(userDBData.writeAt);
  });
});

// describe('Many Insert and Update Operations', () => {
//   test('Create Many record', async () => {
//     expect.assertions(2);
//     const data = await this.userWith.insertManyRecords([{
//       middlename: 'a',
//     }, {
//       middlename: 'b',
//     }, {
//       middlename: 'b',
//     }]);
//     expect(data.ops.map(d => d.middlename)).toMatchObject(['A', 'B', 'B']);
//     expect(data.insertedCount).toBe(3);
//   });

//   test('Update Many record', async () => {
//     expect.assertions(2);
//     const data = await this.userWith.updateManyRecords({ middlename: 'B' }, { middlename: 'c' });
//     expect(data.modifiedCount).toBe(2);
//     const findData = await this.userWith.findToArray({ middlename: 'C' });
//     expect(findData.length).toBe(2);
//   });
// });

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
      await this.myHooks.createRecord(this.userData).save();
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
      await this.myHooks.createRecord({ _id: '507f191e810c19729de860ea', ...this.userData }).delete();
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
        await this.myHooks.createRecord(this.userData).save();
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
  // await this.user.drop();
  // await this.userWith.drop();
  await mongoorm.close(true);
});
