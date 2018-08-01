const mongoorm = require('../mongoorm');

const { Document, Fields } = mongoorm;

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
        pin: fields.Integer({ required: true }),
      };
    }
  }

  this.address = new Address({ document: 'address' });
});

describe('Realtional Field Test', () => {
  describe('One Field Test', () => {
    describe('Required Test', () => {
      const self = this;
      test('required one field', async () => {
        class User extends Document {
          initFields(fields) {
            return {
              firstname: fields.String(),
              lastname: fields.String(),
              address: fields.One({ doc: self.address, required: true }),
            };
          }
        }
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await expect(rec.save()).rejects.toThrow(':: address is required fields');
      });

      test('not required one field', async () => {
        class User extends Document {
          initFields(fields) {
            return {
              firstname: fields.String(),
              lastname: fields.String(),
              address: fields.One({ doc: self.address }),
            };
          }
        }
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await rec.save();
        expect(rec._id.get()).toBeDefined();
        expect(rec.address.get()).toBeUndefined();
      });

      test('not required one field but required document fields', async () => {
        class User extends Document {
          initFields(fields) {
            return {
              firstname: fields.String(),
              lastname: fields.String(),
              address: fields.One({ doc: self.address }),
            };
          }
        }
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
          address: {
            city: 'Mehsana',
          },
        });
        await expect(rec.save()).rejects.toThrow('::  :: pin is required fields');
      });
    });

    test('populate get test', async () => {
      const self = this;
      class User extends Document {
        initFields(fields) {
          return {
            firstname: fields.String(),
            lastname: fields.String(),
            address: fields.One({ doc: self.address }),
          };
        }
      }
      const user = new User({ document: 'user' });
      const rec = user.create({
        firstname: 'Deep',
        lastname: 'Patel',
        address: {
          city: 'Mehsana',
          pin: 384002,
        },
      });
      await rec.save();
      expect(rec.address.get()).toBe(rec.address.record.getId().toString());
      expect(rec.address.get({ populate: true })).toEqual(rec.address.record.toJson());
    });

    describe('Create Update Operations', async () => {
      const self = this;
      class User extends Document {
        initFields(fields) {
          return {
            firstname: fields.String(),
            lastname: fields.String(),
            address: fields.One({ doc: self.address }),
          };
        }
      }

      test('save record in init value', async () => {
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
          address: {
            city: 'Mehsana1',
            pin: 384001,
          },
        });
        await rec.save();
        expect(rec.address._id.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('Mehsana1');
        expect(rec.address.pin.get()).toBe(384001);
      });

      test('save record in set value function', async () => {
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        rec.address.set({
          city: 'Mehsana2',
          pin: 384002,
        });
        await rec.save();
        expect(rec.address._id.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('Mehsana2');
        expect(rec.address.pin.get()).toBe(384002);
      });

      test('update record', async () => {
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await rec.save();
        expect(rec.address.get()).toBeUndefined();
        rec.address.set({
          city: 'Mehsana3',
          pin: 384003,
        });
        await rec.save();
        expect(rec.address.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('Mehsana3');
        expect(rec.address.pin.get()).toBe(384003);
      });

      test('update record if record updated', async () => {
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await rec.save();
        expect(rec.address.pin.get()).toBeUndefined();
        rec.address.city.set('mehsana4');
        rec.address.pin.set(384004);
        await rec.save();
        expect(rec.address.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('mehsana4');
        expect(rec.address.pin.get()).toBe(384004);
      });

      test('update record get record by id record updated', async () => {
        const user = new User({ document: 'user' });
        const rec = user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        expect(rec.address.pin.get()).toBeUndefined();
        expect(rec.address.get()).toBeUndefined();
        await rec.save();
        const newRec = await user.findById(rec._id.get());
        expect(newRec.address.get()).toBeUndefined();
        newRec.address.set({
          city: 'Mehsana5',
          pin: 384005,
        });
        await newRec.save();
        expect(newRec.address.get()).toBeDefined();
        expect(newRec.address.city.get()).toBe('Mehsana5');
        expect(newRec.address.pin.get()).toBe(384005);
      });
    });
  });
});


afterAll(async () => {
  await this.user.drop();
  await this.address.drop();
  await mongoorm.close(true);
});
