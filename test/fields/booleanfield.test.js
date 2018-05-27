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
    test('(+) field required', async () => {
      let field = new BooleanFields({ required: true });
      field.set(booleanValue);
      expect(await field.validate()).toBe();
    });

    test('(+) field not required', async () => {
      let field = new BooleanFields({ required: false });
      expect(await field.validate()).toBe();
    });

    test('(-) field required', async () => {
      let field = new BooleanFields({ required: true });
      field.set(nonBooleanValue);
      await expect(field.validate()).rejects.toThrow('is not boolean type');
    });

    test('(+) error message when key is given', async () => {
      let field = new BooleanFields({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
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
