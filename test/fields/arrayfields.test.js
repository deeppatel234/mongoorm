const { FieldsObj, Fields } = require('../mongoorm');

describe('ArrayFields', () => {
  describe('required property', () => {
    test('basic required test', async () => {
      const req = FieldsObj.Array({ ele: Fields.String(), required: true });
      await expect(req.validate()).rejects.toThrow('is required fields');
      req.push('hello');
      await expect(req.validate()).resolves.toBe();
    });

    test('empty array required test', async () => {
      const req = FieldsObj.Array({ ele: Fields.String(), required: true });
      req.initValue([]);
      await expect(req.validate()).rejects.toThrow('is required fields');
    });
  });

  describe('default property', () => {
    test('default test array element', () => {
      let myField = FieldsObj.Array({ ele: Fields.String(), default: ['a'] });
      expect(myField.get()).toMatchObject(['a']);
    });

    test('default test not array element', () => {
      let myField = FieldsObj.Array({ ele: Fields.String(), default: 'b' });
      expect(myField.get()).toMatchObject(['b']);
    });

    test('default test with field setters', () => {
      let myField = FieldsObj.Array({ ele: Fields.String({ uppercase: true }), default: ['a'] });
      expect(myField.get()).toMatchObject(['A']);
    });
  });

  describe('validation test', () => {
    test('validate blank values without required', async () => {
      let myField = FieldsObj.Array({ ele: Fields.String({ uppercase: true }) });
      expect(myField.validate()).resolves.toBe();
    });

    describe('array field with non-object element', () => {
      test('validate with string array', async () => {
        let myField = FieldsObj.Array({ ele: Fields.String({ uppercase: true }) });
        myField.initValue(['a', 5, 'b']);
        try {
          await myField.validate();
        } catch (e) {
          expect(e.message).toBe(undefined);
        }
        myField.initValue(['a', 'c', 'b']);
        expect(await myField.validate()).toBe();
      });

      test('validate with array of array', async () => {
        let myField = FieldsObj.Array({
          ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
        });
        myField.initValue([['a', 'b', 'c'], ['d', 5, 'f']]);
        try {
          await myField.validate();
        } catch (e) {
          expect(e.message).toBe(undefined);
        }
        myField.initValue([['a', 'b', 'c'], ['d', 'g', 'f']]);
        expect(await myField.validate()).toBe();
      });

      test('validate with array of array of array', async () => {
        let myField = FieldsObj.Array({
          ele: Fields.Array({
            ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
          }),
        });
        myField.initValue([['a', 'b', 'c'], ['d', 5, 'f']]);
        try {
          await myField.validate();
        } catch (e) {
          expect(e.message).toBe(undefined);
        }
        myField.initValue([[['a'], ['b']], [['c'], ['d']]]);
        expect(await myField.validate()).toBe();
      });
    });

    test('array field with object element', async () => {
      let myField = FieldsObj.Array({
        ele: {
          name: Fields.String({ uppercase: true }),
          age: Fields.Integer({ required: true }),
        },
      });

      myField.initValue([{
        name: 'Deep',
        age: 21,
      }, {
        name: 'Vivek',
      }]);

      try {
        await myField.validate();
      } catch (e) {
        expect(e.message).toBe(undefined);
      }
      myField.getByIndex(1).age.set(23);
      expect(await myField.validate()).toBe();
    });
  });

  describe('setters test', () => {
    describe('array field with non-object element', () => {
      test('validate with string array', () => {
        let myField = FieldsObj.Array({ ele: Fields.String({ uppercase: true }) });
        myField.initValue(['a', 'b']);
        expect(myField.get()).toMatchObject(['A', 'B']);
      });

      test('validate with array of array', () => {
        let myField = FieldsObj.Array({
          ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
        });
        myField.initValue([['a', 'b', 'c'], ['d', 'g', 'f']]);
        expect(myField.get()).toMatchObject([['A', 'B', 'C'], ['D', 'G', 'F']]);
      });

      test('validate with array of array of array', () => {
        let myField = FieldsObj.Array({
          ele: Fields.Array({
            ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
          }),
        });
        myField.initValue([[['a', 'b', 'c'], ['d', 'g', 'f']]]);
        expect(myField.get()).toMatchObject([[['A', 'B', 'C'], ['D', 'G', 'F']]]);
      });
    });

    test('array field with object element', () => {
      let myField = FieldsObj.Array({
        ele: {
          name: Fields.String({ uppercase: true }),
          age: Fields.Integer(),
        },
      });

      myField.initValue([{
        name: 'Deep',
        age: 21,
      }, {
        name: 'Vivek',
      }]);

      expect(myField.get()).toMatchObject([{
        name: 'DEEP',
        age: 21,
      }, {
        name: 'VIVEK',
      }]);
    });
  });
});
