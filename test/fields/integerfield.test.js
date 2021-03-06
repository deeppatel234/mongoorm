const { IntegerField } = require('../../lib/fields/BasicFields');

describe('IntegerField', () => {
  const numberValue = 123;
  const otherNumberValue = 456;
  const nonNumberValue = 'string';

  describe('basic field', () => {
    test('(+) type test', () => {
      let field = new IntegerField();
      expect(field.validateType(numberValue)).toBe(true);
    });

    test('(-) type test', () => {
      let field = new IntegerField();
      expect(field.validateType(nonNumberValue)).toBe(false);
    });

    test('(+) value test', () => {
      let field = new IntegerField();
      field.set(numberValue);
      expect(field.get()).toBe(numberValue);
    });

    test('(-) value test', () => {
      let field = new IntegerField();
      field.set(nonNumberValue);

      // this should be failed
      expect(field.get()).toBe(nonNumberValue);
    });

    test('(+) integer value test for float value', () => {
      let field = new IntegerField();
      let floatValue = 123.11;
      field.set(floatValue);
      expect(field.get()).toBe(parseInt(floatValue, 10));
    });
  });

  describe('required property', () => {
    test('(+) field required', async () => {
      let field = new IntegerField({ required: true });
      field.set(numberValue);
      await expect(field.validate()).resolves.toBe();
    });

    test('(+) field not required', async () => {
      let field = new IntegerField({ required: false });
      await expect(field.validate()).resolves.toBe();
    });

    test('(-) field required', async () => {
      let field = new IntegerField({ required: true });
      field.set(nonNumberValue);
      await expect(field.validate()).rejects.toThrow('is not integer type');
    });

    test('(+) error message when key is given', async () => {
      let field = new IntegerField({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
    });

    test('(-) error message when key is not given', async () => {
      let field = new IntegerField({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
    });
  });

  describe('default property', () => {
    test('(+) default value test', () => {
      let field = new IntegerField({ defaultValue: numberValue });
      expect(field.get()).toBe(numberValue);
      field.set(otherNumberValue);
      expect(field.get()).toBe(otherNumberValue);
    });

    test('(+) default function test', () => {
      let field = new IntegerField({ defaultValue: () => numberValue });
      expect(field.get()).toBe(numberValue);
      field.set(otherNumberValue);
      expect(field.get()).toBe(otherNumberValue);
    });
  });

  describe('validators test', () => {
    describe('min value validator', () => {
      test('(+) correct min value', async () => {
        let field = new IntegerField({ min: 100 });
        field.set(123);
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect min value', async () => {
        let field = new IntegerField({ min: 100 });
        field.set(99);
        await expect(field.validate()).rejects.toThrow('Undefined should be minimum 100');
      });
    });

    describe('max value validator', () => {
      test('(+) correct max value', async () => {
        let field = new IntegerField({ max: 100 });
        field.set(99);
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect max value', async () => {
        let field = new IntegerField({ max: 100 });
        field.set(123);
        await expect(field.validate()).rejects.toThrow('Undefined should be maximum 100');
      });
    });

    describe('exclusiveMin value validator', () => {
      test('(+) correct exclusiveMin value', async () => {
        let field = new IntegerField({ exclusiveMin: 100 });
        field.set(101);
        await expect(field.validate()).resolves.toBeDefined();

        field.set(100);
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect exclusiveMin value', async () => {
        let field = new IntegerField({ exclusiveMin: 100 });
        field.set(90);
        await expect(field.validate()).rejects.toThrow('Undefined should be greater or equal to 100');
      });
    });

    describe('exclusiveMax value validator', () => {
      test('(+) correct exclusiveMax value', async () => {
        let field = new IntegerField({ exclusiveMax: 100 });
        field.set(90);
        await expect(field.validate()).resolves.toBeDefined();

        field.set(100);
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect exclusiveMax value', async () => {
        let field = new IntegerField({ exclusiveMax: 100 });
        field.set(111);
        await expect(field.validate()).rejects.toThrow('Undefined should be less or equal to 100');
      });
    });

    describe('multipleOf value validator', () => {
      test('(+) correct multipleOf value', async () => {
        let field = new IntegerField({ multipleOf: 2 });
        field.set(20);
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect multipleOf value', async () => {
        let field = new IntegerField({ multipleOf: 2 });
        field.set(123);
        await expect(field.validate()).rejects.toThrow('Undefined should be multiple of 2');
      });
    });
  });
});
