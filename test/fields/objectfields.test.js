const { Fields } = require('../mongoorm');

const ele = {
  name: Fields.String({ uppercase: true, required: true }),
  address: {
    city: Fields.String({ uppercase: true, required: true }),
    pin: Fields.Integer(),
  },
  age: Fields.Integer(),
};

const complexEle = {
  h: Fields.String({ uppercase: true, required: true }),
  a: {
    f: Fields.String({ uppercase: true, required: true }),
    g: Fields.Integer(),
    b: {
      c: Fields.Integer(),
      d: {
        e: Fields.String({ uppercase: true, required: true }),
      },
    },
  },
  i: Fields.Integer(),
};

describe('ObjectFields', () => {
  describe('preparefields test', () => {
    test('basic preparefields', () => {
      let myField = Fields.Object({ ele });
      expect(myField.address.type).toBe('object');
    });

    test('compalex preparefields', () => {
      let myField = Fields.Object({ ele: complexEle });
      expect(myField.a.type).toBe('object');
      expect(myField.a.b.type).toBe('object');
      expect(myField.a.b.d.type).toBe('object');
    });
  });

  describe('validate data test', () => {
    test('basic validate data', () => {
      let myField = Fields.Object({ ele });
      myField.initValue({
        name: 'deep',
        address: {
          pin: 384002,
        },
      });
      expect(myField.validate()).toBeFalsy();
      myField.address.city.set('gandhinagar');
      expect(myField.validate()).toBeTruthy();
    });

    test('compalex validate data', () => {
      let myField = Fields.Object({ ele: complexEle });
      myField.initValue({
        h: 'h',
        a: {
          g: 1,
          b: {
            c: 3,
          },
        },
        i: 4,
      });
      expect(myField.validate()).toBeFalsy();
      myField.a.f.set('z');
      expect(myField.validate()).toBeFalsy();
      myField.a.b.d.e.set('x');
      expect(myField.validate()).toBeTruthy();
    });
  });

  describe('modified data test', () => {
    test('basic modified data', () => {
      let myField = Fields.Object({ ele });
      myField.initValue({
        name: 'deep',
        address: {
          city: 'mehsana',
          pin: 384002,
        },
      });
      myField.markModified();
      expect(myField.getModifiedData()).toMatchObject({});
      myField.address.city.set('gandhinagar');
      expect(myField.getModifiedData()).toMatchObject({
        address: {
          city: 'GANDHINAGAR',
        },
      });
    });

    test('compalex modified data', () => {
      let myField = Fields.Object({ ele: complexEle });
      myField.initValue({
        h: 'h',
        a: {
          f: 'f',
          g: 1,
          b: {
            c: 3,
            d: {
              e: 'e',
            },
          },
        },
        i: 4,
      });
      myField.markModified();
      expect(myField.getModifiedData()).toMatchObject({});
      myField.a.f.set('z');
      myField.a.b.d.e.set('x');
      expect(myField.get()).toMatchObject({
        a: {
          f: 'Z',
          b: {
            d: {
              e: 'X',
            },
          },
        },
      });
    });
  });

  describe('set and get data test', () => {
    test('basic set data', () => {
      let myField = Fields.Object({ ele });
      myField.initValue({
        name: 'deep',
        address: {
          city: 'mehsana',
          pin: 384002,
        },
      });
      expect(myField.get()).toMatchObject({
        name: 'DEEP',
        address: {
          city: 'MEHSANA',
          pin: 384002,
        },
      });
      myField.address.city.set('gandhinagar');
      expect(myField.get()).toMatchObject({
        name: 'DEEP',
        address: {
          city: 'GANDHINAGAR',
          pin: 384002,
        },
      });
    });

    test('compalex set data', () => {
      let myField = Fields.Object({ ele: complexEle });
      myField.initValue({
        h: 'h',
        a: {
          f: 'f',
          g: 1,
          b: {
            c: 3,
            d: {
              e: 'e',
            },
          },
        },
        i: 4,
      });
      expect(myField.get()).toMatchObject({
        h: 'H',
        a: {
          f: 'F',
          g: 1,
          b: {
            c: 3,
            d: {
              e: 'E',
            },
          },
        },
        i: 4,
      });
      myField.a.f.set('z');
      myField.a.b.d.e.set('x');
      expect(myField.get()).toMatchObject({
        h: 'H',
        a: {
          f: 'Z',
          g: 1,
          b: {
            c: 3,
            d: {
              e: 'X',
            },
          },
        },
        i: 4,
      });
    });
  });

  describe('getGlobleProps test', () => {
    test('basic getGlobleProps', () => {
      let myField = Fields.Object({ ele });
      expect(myField.getGlobleProps('required')).toMatchObject({ name: true, address: { city: true } });
      expect(myField.getGlobleProps(['required'])).toMatchObject({ name: { required: true }, address: { city: { required: true } } });
    });

    test('compalex getGlobleProps', () => {
      let myField = Fields.Object({ ele: complexEle });
      expect(myField.getGlobleProps('required')).toMatchObject({ h: true, a: { f: true, b: { d: { e: true } } } });
      expect(myField.getGlobleProps(['required'])).toMatchObject({ h: { required: true }, a: { f: { required: true }, b: { d: { e: { required: true } } } } });
    });
  });
});
