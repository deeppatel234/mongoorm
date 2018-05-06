const { Fields } = require('../mongoorm');

describe('ArrayFields', () => {
  describe('required property', () => {
    test('basic required test', () => {
      const req = Fields.Array({ ele: Fields.String(), required: true });
      expect(req.validate()).toBeFalsy();
      req.push('hello');
      expect(req.validate()).toBeTruthy();
    });

    test('empty array required test', () => {
      const req = Fields.Array({ ele: Fields.String(), required: true });
      req.initValue([]);
      expect(req.validate()).toBeFalsy();
      expect(req.getErrorMessage('hello')[0]).toBe('hello is required fields');
    });
  });

  describe('default property', () => {
    test('default test', () => {
      let myField = Fields.Array({ ele: Fields.String(), default: ['a'] });
      expect(myField.get()).toMatchObject(['a']);
    });

    test('default test with field setters', () => {
      let myField = Fields.Array({ ele: Fields.String({ uppercase: true }), default: ['a'] });
      expect(myField.get()).toMatchObject(['A']);
    });
  });

  describe('validation test', () => {
    describe('array field with non-object element', () => {
      test('validate with string array', () => {
        let myField = Fields.Array({ ele: Fields.String({ uppercase: true }) });
        myField.initValue(['a', 5, 'b']);
        expect(myField.validate()).toBeFalsy();
        expect(myField.getErrorMessage('hello')[0]).toBe('hello : 1 index is not string type');
        myField.initValue(['a', 'c', 'b']);
        expect(myField.validate()).toBeTruthy();
      });

      test('validate with array of array', () => {
        let myField = Fields.Array({
          ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
        });
        myField.initValue([['a', 'b', 'c'], ['d', 5, 'f']]);
        expect(myField.validate()).toBeFalsy();
        expect(myField.getErrorMessage('hello')[0]).toBe('hello : 1 index : 1 index is not string type');
        myField.initValue([['a', 'b', 'c'], ['d', 'g', 'f']]);
        expect(myField.validate()).toBeTruthy();
      });

      test('validate with array of array of array', () => {
        let myField = Fields.Array({
          ele: Fields.Array({
            ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
          }),
        });
        myField.initValue([['a', 'b', 'c'], ['d', 5, 'f']]);
        expect(myField.validate()).toBeFalsy();
        expect(myField.getErrorMessage('hello')[0]).toBe('hello : 0 index : 0 index is not array type');
        myField.initValue([[['a'], ['b']], [['c'], ['d']]]);
        expect(myField.validate()).toBeTruthy();
      });
    });

    test('array field with object element', () => {
      let myField = Fields.Array({
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

      expect(myField.validate()).toBeFalsy();
      expect(myField.getErrorMessage('hello')[0]).toBe('age is required fields');

      myField.getEle(1).age.set(23);
      expect(myField.validate()).toBeTruthy();
    });
  });

  describe('setters test', () => {
    describe('array field with non-object element', () => {
      test('validate with string array', () => {
        let myField = Fields.Array({ ele: Fields.String({ uppercase: true }) });
        myField.initValue(['a', 'b']);
        expect(myField.get()).toMatchObject(['A', 'B']);
      });

      test('validate with array of array', () => {
        let myField = Fields.Array({
          ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
        });
        myField.initValue([['a', 'b', 'c'], ['d', 'g', 'f']]);
        expect(myField.get()).toMatchObject([['A', 'B', 'C'], ['D', 'G', 'F']]);
      });

      test('validate with array of array of array', () => {
        let myField = Fields.Array({
          ele: Fields.Array({
            ele: Fields.Array({ ele: Fields.String({ uppercase: true }) }),
          }),
        });
        myField.initValue([[['a', 'b', 'c'], ['d', 'g', 'f']]]);
        expect(myField.get()).toMatchObject([[['A', 'B', 'C'], ['D', 'G', 'F']]]);
      });
    });

    test('array field with object element', () => {
      let myField = Fields.Array({
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
