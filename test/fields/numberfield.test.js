const { NumberFields } = require('../../lib/fields/BasicFields');

describe('NumberFields', () => {
  const numberValue = 123;
  const otherNumberValue = 456;
  const nonNumberValue = 'string';

  describe('basic field', () => {
    test('(+) type test', () => {
      let field = new NumberFields();
      expect(field.validateType(numberValue)).toBe(true);
    });

    test('(-) type test', () => {
      let field = new NumberFields();
      expect(field.validateType(nonNumberValue)).toBe(false);
    });

    test('(+) value test', () => {
      let field = new NumberFields();
      field.set(numberValue);
      expect(field.get()).toBe(numberValue);
    });

    test('(-) value test', () => {
      let field = new NumberFields();
      field.set(nonNumberValue);

      // this should be failed
      expect(field.get()).toBe(nonNumberValue);
    });
  });

  describe('required property', () => {
    test('(+) field required', async () => {
      let field = new NumberFields({ required: true });
      field.set(numberValue);
      await expect(field.validate()).resolves.toBe();
    });

    test('(+) field not required', async () => {
      let field = new NumberFields({ required: false });
      await expect(field.validate()).resolves.toBe();
    });

    test('(-) field required', async () => {
      let field = new NumberFields({ required: true });
      field.set(nonNumberValue);
      await expect(field.validate()).rejects.toThrow('is not number type');
    });

    test('(+) error message when key is given', async () => {
      let field = new NumberFields({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
    });

    test('(-) error message when key is not given', async () => {
      let field = new NumberFields({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
    });
  });

  describe('default property', () => {
    test('(+) default value test', () => {
      let field = new NumberFields({ default: numberValue });
      expect(field.get()).toBe(numberValue);
      field.set(otherNumberValue);
      expect(field.get()).toBe(otherNumberValue);
    });

    test('(+) default function test', () => {
      let field = new NumberFields({ default: () => numberValue });
      expect(field.get()).toBe(numberValue);
      field.set(otherNumberValue);
      expect(field.get()).toBe(otherNumberValue);
    });
  });

  describe('validators test', () => {
    describe('min value validator', () => {
      test('(+) correct min value', async () => {
        let field = new NumberFields({ min: 100 });
        field.set(123);
        await expect(field.validate()).resolves.toBe();
      });

      test('(-) incorrect min value', async () => {
        let field = new NumberFields({ min: 100 });
        field.set(99);
        await expect(field.validate()).rejects.toThrow('should be minimum 100');
      });
    });

    describe('max value validator', () => {
      test('(+) correct max value', async () => {
        let field = new NumberFields({ max: 100 });
        field.set(99);
        await expect(field.validate()).resolves.toBe();
      });

      test('(-) incorrect max value', async () => {
        let field = new NumberFields({ max: 100 });
        field.set(123);
        await expect(field.validate()).rejects.toThrow('should be maximum 100');
      });
    });

    describe('exclusiveMin value validator', () => {
      test('(+) correct exclusiveMin value', async () => {
        let field = new NumberFields({ exclusiveMin: 100 });
        field.set(101);
        await expect(field.validate()).resolves.toBe();

        field.set(100);
        await expect(field.validate()).resolves.toBe();
      });

      test('(-) incorrect exclusiveMin value', async () => {
        let field = new NumberFields({ exclusiveMin: 100 });
        field.set(90);
        await expect(field.validate()).rejects.toThrow('should be greater or equal to 100');
      });
    });

    describe('exclusiveMax value validator', () => {
      test('(+) correct exclusiveMax value', async () => {
        let field = new NumberFields({ exclusiveMax: 100 });
        field.set(90);
        await expect(field.validate()).resolves.toBe();

        field.set(100);
        await expect(field.validate()).resolves.toBe();
      });

      test('(-) incorrect exclusiveMax value', async () => {
        let field = new NumberFields({ exclusiveMax: 100 });
        field.set(111);
        await expect(field.validate()).rejects.toThrow('should be less or equal to 100');
      });
    });

    describe('multipleOf value validator', () => {
      test('(+) correct multipleOf value', async () => {
        let field = new NumberFields({ multipleOf: 2 });
        field.set(20);
        await expect(field.validate()).resolves.toBe();
      });

      test('(-) incorrect multipleOf value', async () => {
        let field = new NumberFields({ multipleOf: 2 });
        field.set(123);
        await expect(field.validate()).rejects.toThrow('should be multiple of 2');
      });
    });

    describe('enum value validator', () => {
      test('(+) correct enum value', async () => {
        let field = new NumberFields({ enum: [10, 20, 30, 40, 50] });
        field.set(20);
        await expect(field.validate()).resolves.toBe();
      });

      test('(-) incorrect enum value', async () => {
        let field = new NumberFields({ enum: [10, 20, 30, 40, 50] });
        field.set(123);
        await expect(field.validate()).rejects.toThrow('is not valid enum value');
      });
    });
  });
});
