const { BooleanFields } = require('../../lib/fields/BasicFields');

describe('BooleanFields', () => {
  const booleanValue = true;
  const otherBooleanValue = false;
  const nonBooleanValue = 12345;

  describe('basic field', () => {
    test('(+) type test', () => {
      let field = new BooleanFields();
      expect(field.validateType(booleanValue)).toBe(true);
    });

    test('(-) type test', () => {
      let field = new BooleanFields();
      expect(field.validateType(nonBooleanValue)).toBe(false);
    });

    test('(+) value test', () => {
      let field = new BooleanFields();
      field.set(booleanValue);
      expect(field.get()).toBe(booleanValue);
    });

    test('(-) value test', () => {
      let field = new BooleanFields();
      field.set(nonBooleanValue);

      // this should be failed
      expect(field.get()).toBe(nonBooleanValue);
    });
  });

  describe('required property', () => {
    test('(+) field required', () => {
      let field = new BooleanFields({ required: true });
      field.set(booleanValue);
      expect(field.validate()).toBe(true);
    });

    test('(+) field not required', () => {
      let field = new BooleanFields({ required: false });
      expect(field.validate()).toBe(true);
    });

    test('(-) field required', () => {
      let field = new BooleanFields({ required: true });
      field.set(nonBooleanValue);
      expect(field.validate()).toBe(false);
    });

    test('(+) error message when key is given', () => {
      let field = new BooleanFields({ required: true });
      expect(field.validate()).toBeFalsy();
      expect(field.getErrorMessage('key').length).toBe(1);
      expect(field.getErrorMessage('key')[0]).toBe('key is required fields');
    });

    test('(-) error message when key is not given', () => {
      let field = new BooleanFields({ required: true });
      expect(field.validate()).toBeFalsy();
      expect(field.getErrorMessage('key').length).toBe(1);
      expect(field.getErrorMessage()[0]).toBe('undefined is required fields');
    });
  });

  describe('default property', () => {
    test('(+) default value test', () => {
      let field = new BooleanFields({ default: booleanValue });
      expect(field.get()).toBe(booleanValue);
      field.set(otherBooleanValue);
      expect(field.get()).toBe(otherBooleanValue);
    });

    test('(+) default function test', () => {
      let field = new BooleanFields({ default: () => booleanValue });
      expect(field.get()).toBe(booleanValue);
      field.set(otherBooleanValue);
      expect(field.get()).toBe(otherBooleanValue);
    });
  });
});
