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
    test('basic required test', () => {
      let myField = new MyFields({ required: true });
      expect(myField.validate()).toBe(false);
      myField.set(123);
      expect(myField.validate()).toBe(true);
    });

    test('required error message should be hello is required fields', () => {
      let myField = new MyFields({ required: true });
      myField.validate();
      expect(myField.getErrorMessage('hello')[0]).toBe('hello is required fields');
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
    test('test three validator', () => {
      let myField = new MyFields({ three: true });
      myField.set(9);
      expect(myField.validate()).toBe(false);
      myField.set(3);
      expect(myField.validate()).toBe(true);
    });

    test('register validator in field', () => {
      let myField = new MyFields();
      myField.setValidator({});
      expect(myField.validateAttrs.length).toBe(2);
      myField.setValidator([{}, {}]);
      expect(myField.validateAttrs.length).toBe(4);
    });
  });
});
