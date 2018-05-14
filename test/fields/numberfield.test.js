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
    test('(+) field required', () => {
      let field = new NumberFields({ required: true });
      field.set(numberValue);
      expect(field.validate()).toBe(true);
    });

    test('(+) field not required', () => {
      let field = new NumberFields({ required: false });
      expect(field.validate()).toBe(true);
    });

    test('(-) field required', () => {
      let field = new NumberFields({ required: true });
      field.set(nonNumberValue);
      expect(field.validate()).toBe(false);
    });

    test('(+) error message when key is given', () => {
      let field = new NumberFields({ required: true });
      expect(field.validate()).toBeFalsy();
      expect(field.getErrorMessage('key').length).toBe(1);
      expect(field.getErrorMessage('key')[0]).toBe('key is required fields');
    });

    test('(-) error message when key is not given', () => {
      let field = new NumberFields({ required: true });
      expect(field.validate()).toBeFalsy();
      expect(field.getErrorMessage('key').length).toBe(1);
      expect(field.getErrorMessage()[0]).toBe('undefined is required fields');
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
      test('(+) correct min value', () => {
        let field = new NumberFields({ min: 100 });
        field.set(123);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect min value', () => {
        let field = new NumberFields({ min: 100 });
        field.set(99);
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be minimum 100');
      });
    });

    describe('max value validator', () => {
      test('(+) correct max value', () => {
        let field = new NumberFields({ max: 100 });
        field.set(99);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect max value', () => {
        let field = new NumberFields({ max: 100 });
        field.set(123);
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be maximum 100');
      });
    });

    describe('exclusiveMin value validator', () => {
      test('(+) correct exclusiveMin value', () => {
        let field = new NumberFields({ exclusiveMin: 100 });
        field.set(101);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);

        field.set(100);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect exclusiveMin value', () => {
        let field = new NumberFields({ exclusiveMin: 100 });
        field.set(90);
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be greater or equal to 100');
      });
    });

    describe('exclusiveMax value validator', () => {
      test('(+) correct exclusiveMax value', () => {
        let field = new NumberFields({ exclusiveMax: 100 });
        field.set(90);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);

        field.set(100);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect exclusiveMax value', () => {
        let field = new NumberFields({ exclusiveMax: 100 });
        field.set(111);
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be less or equal to 100');
      });
    });

    describe('multipleOf value validator', () => {
      test('(+) correct multipleOf value', () => {
        let field = new NumberFields({ multipleOf: 2 });
        field.set(20);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect multipleOf value', () => {
        let field = new NumberFields({ multipleOf: 2 });
        field.set(123);
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be multiple of 2');
      });
    });

    describe('enum value validator', () => {
      test('(+) correct enum value', () => {
        let field = new NumberFields({ enum: [10, 20, 30, 40, 50] });
        field.set(20);
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect enum value', () => {
        let field = new NumberFields({ enum: [10, 20, 30, 40, 50] });
        field.set(123);
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key is not valid enum value');
      });
    });
  });
});
