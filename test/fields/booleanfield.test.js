const { BooleanField } = require('../../lib/fields/BasicFields');

describe('BooleanField', () => {
  const booleanValue = true;
  const otherBooleanValue = false;
  const nonBooleanValue = 12345;

  describe('basic field', () => {
    test('(+) type test', () => {
      let field = new BooleanField();
      expect(field.validateType(booleanValue)).toBe(true);
    });

    test('(-) type test', () => {
      let field = new BooleanField();
      expect(field.validateType(nonBooleanValue)).toBe(false);
    });

    test('(+) value test', () => {
      let field = new BooleanField();
      field.set(booleanValue);
      expect(field.get()).toBe(booleanValue);
    });

    test('(-) value test', () => {
      let field = new BooleanField();
      field.set(nonBooleanValue);

      // this should be failed
      expect(field.get()).toBe(nonBooleanValue);
    });
  });

  describe('required property', () => {
    test('(+) field required', async () => {
      let field = new BooleanField({ required: true });
      field.set(booleanValue);
      expect(await field.validate()).toBe();
    });

    test('(+) field not required', async () => {
      let field = new BooleanField({ required: false });
      expect(await field.validate()).toBe();
    });

    test('(-) field required', async () => {
      let field = new BooleanField({ required: true });
      field.set(nonBooleanValue);
      await expect(field.validate()).rejects.toThrow('Undefined is not boolean type');
    });

    test('(+) error message when key is given', async () => {
      let field = new BooleanField({ required: true });
      await expect(field.validate()).rejects.toThrow('Undefined is required fields');
    });
  });

  describe('defaultValue property', () => {
    test('(+) defaultValue value test', () => {
      let field = new BooleanField({ defaultValue: booleanValue });
      expect(field.get()).toBe(booleanValue);
      field.set(otherBooleanValue);
      expect(field.get()).toBe(otherBooleanValue);
    });

    test('(+) defaultValue function test', () => {
      let field = new BooleanField({ defaultValue: () => booleanValue });
      expect(field.get()).toBe(booleanValue);
      field.set(otherBooleanValue);
      expect(field.get()).toBe(otherBooleanValue);
    });
  });
});
