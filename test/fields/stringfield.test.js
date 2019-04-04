const { StringField } = require('../../lib/fields/BasicFields');

describe('StringField', () => {
  const stringValue = 'string';
  const otherStringValue = 'other string';
  const nonStringValue = 12345;

  describe('basic field', () => {
    test('(+) type test', () => {
      let field = new StringField();
      expect(field.validateType(stringValue)).toBe(true);
    });

    test('(-) type test', () => {
      let field = new StringField();
      expect(field.validateType(nonStringValue)).toBe(false);
    });

    test('(+) value test', () => {
      let field = new StringField();
      field.set(stringValue);
      expect(field.get()).toBe(stringValue);
    });

    test('(-) value test', () => {
      let field = new StringField();
      field.set(nonStringValue);

      // this should be failed
      expect(field.get()).toBe(nonStringValue);
    });
  });

  describe('required property', () => {
    test('(+) field required', async () => {
      let field = new StringField({ required: true });
      field.set(stringValue);
      await expect(field.validate()).resolves.toBe();
    });

    test('(+) field not required', async () => {
      let field = new StringField({ required: false });
      await expect(field.validate()).resolves.toBe();
    });

    test('(-) field required', async () => {
      let field = new StringField({ required: true });
      field.set(nonStringValue);
      await expect(field.validate()).rejects.toThrow('is not string type');
    });

    test('(+) error message when key is given', async () => {
      let field = new StringField({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
    });

    test('(-) error message when key is not given', async () => {
      let field = new StringField({ required: true });
      await expect(field.validate()).rejects.toThrow('is required fields');
    });
  });

  describe('default property', () => {
    test('(+) default value test', () => {
      let field = new StringField({ defaultValue: stringValue });
      expect(field.get()).toBe(stringValue);
      field.set(otherStringValue);
      expect(field.get()).toBe(otherStringValue);
    });

    test('(+) default function test', () => {
      let field = new StringField({ defaultValue: () => stringValue });
      expect(field.get()).toBe(stringValue);
      field.set(otherStringValue);
      expect(field.get()).toBe(otherStringValue);
    });
  });

  describe('setters test', () => {
    describe('trim property', () => {
      test('(+) trim enabled', () => {
        let field = new StringField({ trim: true });
        field.set(`${stringValue}   `);
        expect(field.get()).toBe(stringValue);
      });

      test('(-) trim disabled', () => {
        let field = new StringField({ trim: false });
        field.set(`${stringValue}   `);
        expect(field.get()).toBe(`${stringValue}   `);
      });
    });

    describe('lowercase property', () => {
      test('(+) lowercase enabled', () => {
        let field = new StringField({ lowercase: true });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue.toLowerCase());
      });

      test('(-) lowercase disabled', () => {
        let field = new StringField({ lowercase: false });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue);
      });
    });

    describe('uppercase property', () => {
      test('(+) uppercase enabled', () => {
        let field = new StringField({ uppercase: true });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue.toUpperCase());
      });

      test('(-) uppercase disabled', () => {
        let field = new StringField({ uppercase: false });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue);
      });
    });

    describe('capitalize property', () => {
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      test('(+) capitalize default value', () => {
        let field = new StringField({ capitalize: true, defaultValue: 'hello' });
        expect(field.get()).toBe('Hello');
      });

      test('(+) capitalize enabled', () => {
        let field = new StringField({ capitalize: true });
        field.set(stringValue);
        expect(field.get()).toBe(capitalizeFirstLetter(stringValue));
      });

      test('(-) capitalize disabled', () => {
        let field = new StringField({ capitalize: false });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue);
      });
    });
  });

  describe('validators test', () => {
    describe('match validator', () => {
      let regularExpression = /ing/g;

      test('(+) correct match', async () => {
        let field = new StringField({ match: regularExpression });
        field.set('string');
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect match', async () => {
        let field = new StringField({ match: regularExpression });
        field.set('other');
        await expect(field.validate()).rejects.toThrow('is not valid');
      });
    });

    describe('maxLength validator', () => {
      test('(+) correct maxLength', async () => {
        let field = new StringField({ maxLength: 10 });
        field.set('string');
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect maxLength', async () => {
        let field = new StringField({ maxLength: 3 });
        field.set('other');
        await expect(field.validate()).rejects.toThrow('should be max 3 length');
      });

      describe('enum validator', () => {
        test('(+) correct enum', async () => {
          let field = new StringField({ enum: ['MALE', 'FEMALE'] });
          field.set('MALE');
          await expect(field.validate()).resolves.toBeDefined();
        });

        test('(-) incorrect enum', async () => {
          let field = new StringField({ enum: ['MALE', 'FEMALE'] });
          field.set('UNKNOWN');
          await expect(field.validate()).rejects.toThrow('is not valid enum value');
        });
      });
    });

    describe('minLength validator', () => {
      test('(+) correct minLength', async () => {
        let field = new StringField({ minLength: 1 });
        field.set('string');
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect maxLength', async () => {
        let field = new StringField({ minLength: 10 });
        field.set('other');
        await expect(field.validate()).rejects.toThrow('should be min 10 length');
      });
    });

    describe('email validator', () => {
      test('(+) correct email', async () => {
        let field = new StringField({ email: true });
        field.set('foo@bar.com');
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect email', async () => {
        let field = new StringField({ email: true });
        field.set('foobar.com');
        await expect(field.validate()).rejects.toThrow('is not valid email');
      });
    });

    describe('enum validator', () => {
      test('(+) correct enum', async () => {
        let field = new StringField({ enum: ['MALE', 'FEMALE'] });
        field.set('MALE');
        await expect(field.validate()).resolves.toBeDefined();
      });

      test('(-) incorrect enum', async () => {
        let field = new StringField({ enum: ['MALE', 'FEMALE'] });
        field.set('UNKNOWN');
        await expect(field.validate()).rejects.toThrow('is not valid enum value');
      });
    });
  });
});
