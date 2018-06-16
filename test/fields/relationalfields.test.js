const mongoorm = require('../mongoorm');

const { Document } = mongoorm;

mongoorm.setLogger({
  info: console.info,
  error: console.error,
});


beforeAll(async () => {
  await mongoorm.connect('mongodb://localhost:27017/mongoormtest');

  class Address extends Document {
    initFields(fields) {
      return {
        city: fields.String(),
        pin: fields.String(),
      };
    }
  }

  let address = new Address({ document: 'address' });

  class UserOne extends Document {
    initFields(fields) {
      return {
        firstname: fields.String(),
        lastname: fields.String(),
        address: fields.One({ doc: address }),
      };
    }
  }

  class UserMany extends Document {
    initFields(fields) {
      return {
        firstname: fields.String(),
        lastname: fields.String(),
        address: fields.Many({ doc: address }),
      };
    }
  }

  this.userOneData = {
    firstname: 'Deep',
    lastname: 'Patel',
    address: {
      city: 'Mehsana',
      pin: '384002',
    },
  };

  this.userManyData = {
    firstname: 'Deep',
    lastname: 'Patel',
    address: [{
      city: 'Mehsana',
      pin: '384002',
    }, {
      city: 'Gandhinagar',
      pin: '384007',
    }],
  };

  this.userOne = new UserOne({ document: 'user' });
  this.userMany = new UserMany({ document: 'user' });
  this.address = address;
  this.recordOne = this.userOne.create(this.userOneData);
  this.recordOneUpdate = this.userOne.create(this.userOneData);
  this.recordMany = this.userMany.create(this.userManyData);
});

describe('Realtional Field Test', () => {
  test('Save one field record', async () => {
    expect.assertions(6);
    await this.recordOne.save();
    expect(this.recordOne.address._id.get()).toBeDefined();
    let addressDBData = await this.address.findOne({ _id: this.recordOne.address.get() });
    expect(this.recordOne.address.get({ populate: true })).toEqual(addressDBData);
    expect(this.userOneData.address.city).toBe(addressDBData.city);
    expect(this.userOneData.address.pin).toBe(addressDBData.pin);
    expect(this.recordOne.address.city.get()).toBe('Mehsana');
    expect(this.recordOne.address.pin.get()).toBe('384002');
  });

  test('update one field record', async () => {
    expect.assertions(3);
    await this.recordOneUpdate.save();
    expect(this.recordOneUpdate.address._id.get()).toBeDefined();
    this.recordOneUpdate.address.city.set('Pune');
    await this.recordOneUpdate.save();
    let addressDBData = await this.address.findOne({ _id: this.recordOneUpdate.address._id.get() });
    expect(addressDBData.city).toBe('Pune');
    expect(this.recordOneUpdate.address.pin.get()).toBe('384002');
  });

  test('Save many field record', async () => {
    expect.assertions(8);
    await this.recordMany.save();
    expect(this.recordMany.address.getEle(0)._id.get()).toBeDefined();
    expect(this.recordMany.address.getEle(1)._id.get()).toBeDefined();
    let addressDBData = await this.address.findOne({
      _id: this.recordMany.address.getEle(0).get(),
    });
    expect(this.recordMany.address.getEle(0).get({ populate: true })).toEqual(addressDBData);
    expect(this.userManyData.address[0].city).toBe(addressDBData.city);
    expect(this.userManyData.address[0].pin).toBe(addressDBData.pin);
    addressDBData = await this.address.findOne({
      _id: this.recordMany.address.getEle(1).get(),
    });
    expect(this.recordMany.address.getEle(1).get({ populate: true })).toEqual(addressDBData);
    expect(this.userManyData.address[1].city).toBe(addressDBData.city);
    expect(this.userManyData.address[1].pin).toBe(addressDBData.pin);
  });
});


afterAll(async () => {
  await this.user.drop();
  await this.address.drop();
  await mongoorm.close(true);
});
