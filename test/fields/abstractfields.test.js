const AbstractFields = require('../../lib/fields/AbstractFields');

describe('AbstractFields', () => {
  class MyFields extends AbstractFields {
    constructor(props) {
      super(props);
      this.type = 'string';

      this.setSetter([{ prop: 'double', func: (prop, value) => value * 2 }]);

      this.setValidator([{ prop: 'three', func: (prop, value) => value === 3, message: '{KEY} should be 3 not {VAL}' }]);
    }

    validateType() {
      return true;
    }
  }

  describe('required property', () => {
    test('basic required test', async () => {
      let myField = new MyFields({ required: true });
      expect(myField.validate()).rejects.toThrow('is required fields');
      myField.set(123);
      expect(myField.validate()).resolves.toBe();
    });
  });

  describe('default property', () => {
    test('default test', () => {
      let myField = new MyFields({ default: 'Hello' });
      expect(myField.get()).toBe('Hello');
      myField.set('World');
      expect(myField.get()).toBe('World');
    });

    test('default function test', () => {
      let myField = new MyFields({ default: () => 'Hello' });
      expect(myField.get()).toBe('Hello');
      myField.set('World');
      expect(myField.get()).toBe('World');
    });
  });

  describe('setters test', () => {
    test('test double setter', () => {
      let myField = new MyFields({ double: true });
      myField.set(4);
      expect(myField.get()).toBe(8);
    });

    test('double setter not call when no value passed', () => {
      let myField = new MyFields({ double: true });
      expect(myField.get()).toBe(undefined);
    });

    test('register setters in field', () => {
      let myField = new MyFields({ double: true });
      myField.setSetter({});
      expect(myField.setAttrs.length).toBe(2);
      myField.setSetter([{}, {}]);
      expect(myField.setAttrs.length).toBe(4);
    });
  });

  describe('validator test', () => {
    test('test three validator', async () => {
      let myField = new MyFields({ three: true });
      myField.set(9);
      expect(myField.validate()).rejects.toThrow('{KEY} should be 3 not true');
      myField.set(3);
      expect(myField.validate()).resolves.toBe();
    });

    test('register validator in field', () => {
      let myField = new MyFields();
      myField.setValidator({});
      expect(myField.validateAttrs.length).toBe(2);
      myField.setValidator([{}, {}]);
      expect(myField.validateAttrs.length).toBe(4);
    });
  });

  describe('modified field test', () => {
    test('modified when init fields', () => {
      let myField = new MyFields({ three: true });
      myField.initValue(9);
      expect(myField.isModified).toBeTruthy();
    });

    test('modified when set fields', () => {
      let myField = new MyFields({ three: true });
      myField.set(9);
      expect(myField.isModified).toBeTruthy();
    });
  });

  describe('required props test', () => {
    class MyProp extends AbstractFields {
      getRequiredProps() {
        return ['myprop'];
      }
    }

    test('should throw myprop not defined error', () => {
      expect(() => new MyProp()).toThrowError('myprop is not defined');
    });

    test('should not throw myprop not defined error', () => {
      expect(() => new MyProp({ myprop: true })).toBeDefined();
    });
  });

  describe('getProps field test', () => {
    test('getProps with string param', () => {
      let myField = new MyFields({ three: true });
      expect(myField.getProps('three')).toBe(true);
    });

    test('getProps with list param', () => {
      let myField = new MyFields({ three: true });
      expect(myField.getProps(['three'])).toMatchObject({ three: true });
    });
  });
});
