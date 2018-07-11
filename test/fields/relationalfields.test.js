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

  class User extends Document {
    initFields(fields) {
      return {
        firstname: fields.String(),
        lastname: fields.String(),
      };
    }
  }

  this.user = new User({ document: 'user' });
});

describe('Realtional Field Test', () => {
  describe('One Field Test', () => {
    describe('Required Test', () => {
      test('required one field', async () => {
        this.user.fields.address = Fields.One({ doc: this.address, required: true });
        this.user.fields.elementsKeys.push('address');
        const rec = this.user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await expect(rec.save()).rejects.toThrow(':: address is required fields');
      });

      test('not required one field', async () => {
        this.user.fields.address = Fields.One({ doc: this.address });
        const rec = this.user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await rec.save();
        expect(rec._id.get()).toBeDefined();
        expect(rec.address.get()).toBeUndefined();
      });

      test('not required one field but required document fields', async () => {
        this.user.fields.address = Fields.One({ doc: this.address });
        const rec = this.user.create({
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
      const rec = this.user.create({
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
      test('save record', async () => {
        const rec = this.user.create({
          firstname: 'Deep',
          lastname: 'Patel',
          address: {
            city: 'Mehsana',
            pin: 384002,
          },
        });
        await rec.save();
        expect(rec.address._id.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('Mehsana');
        expect(rec.address.pin.get()).toBe(384002);
      });

      test('update record', async () => {
        const rec = this.user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await rec.save();
        expect(rec.address.get()).toBeUndefined();
        rec.address.set({
          city: 'Mehsana',
          pin: 384002,
        });
        await rec.save();
        expect(rec.address.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('Mehsana');
        expect(rec.address.pin.get()).toBe(384002);
      });

      test('update record if record updated', async () => {
        const rec = this.user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        await rec.save();
        expect(rec.address.pin.get()).toBeUndefined();
        rec.address.city.set('mehsana');
        rec.address.pin.set(384002);
        await rec.save();
        expect(rec.address.get()).toBeDefined();
        expect(rec.address.city.get()).toBe('mehsana');
        expect(rec.address.pin.get()).toBe(384002);
      });

      test('update record get record by id record updated', async () => {
        const rec = this.user.create({
          firstname: 'Deep',
          lastname: 'Patel',
        });
        expect(rec.address.pin.get()).toBeUndefined();
        expect(rec.address.get()).toBeUndefined();
        await rec.save();
        const newRec = await this.user.findById(rec._id.get());
        expect(newRec.address.get()).toBeUndefined();
        newRec.address.set({
          city: 'Mehsana',
          pin: 384002,
        });
        await newRec.save();
        expect(newRec.address.get()).toBeDefined();
        expect(newRec.address.city.get()).toBe('Mehsana');
        expect(newRec.address.pin.get()).toBe(384002);
      });
    });
  });
});


afterAll(async () => {
  await this.user.drop();
  await this.address.drop();
  await mongoorm.close(true);
});
