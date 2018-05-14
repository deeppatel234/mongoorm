const { StringFields } = require('../../lib/fields/BasicFields');

describe('StringFields', () => {
  const stringValue = 'string';
  const otherStringValue = 'other string';
  const nonStringValue = 12345;

  describe('basic field', () => {
    test('(+) type test', () => {
      let field = new StringFields();
      expect(field.validateType(stringValue)).toBe(true);
    });

    test('(-) type test', () => {
      let field = new StringFields();
      expect(field.validateType(nonStringValue)).toBe(false);
    });

    test('(+) value test', () => {
      let field = new StringFields();
      field.set(stringValue);
      expect(field.get()).toBe(stringValue);
    });

    test('(-) value test', () => {
      let field = new StringFields();
      field.set(nonStringValue);

      // this should be failed
      expect(field.get()).toBe(nonStringValue);
    });
  });

  describe('required property', () => {
    test('(+) field required', () => {
      let field = new StringFields({ required: true });
      field.set(stringValue);
      expect(field.validate()).toBe(true);
    });

    test('(+) field not required', () => {
      let field = new StringFields({ required: false });
      expect(field.validate()).toBe(true);
    });

    test('(-) field required', () => {
      let field = new StringFields({ required: true });
      field.set(nonStringValue);
      expect(field.validate()).toBe(false);
    });

    test('(+) error message when key is given', () => {
      let field = new StringFields({ required: true });
      expect(field.validate()).toBeFalsy();
      expect(field.getErrorMessage('key').length).toBe(1);
      expect(field.getErrorMessage('key')[0]).toBe('key is required fields');
    });

    test('(-) error message when key is not given', () => {
      let field = new StringFields({ required: true });
      expect(field.validate()).toBeFalsy();
      expect(field.getErrorMessage('key').length).toBe(1);
      expect(field.getErrorMessage()[0]).toBe('undefined is required fields');
    });
  });

  describe('default property', () => {
    test('(+) default value test', () => {
      let field = new StringFields({ default: stringValue });
      expect(field.get()).toBe(stringValue);
      field.set(otherStringValue);
      expect(field.get()).toBe(otherStringValue);
    });

    test('(+) default function test', () => {
      let field = new StringFields({ default: () => stringValue });
      expect(field.get()).toBe(stringValue);
      field.set(otherStringValue);
      expect(field.get()).toBe(otherStringValue);
    });
  });

  describe('setters test', () => {
    describe('trim property', () => {
      test('(+) trim enabled', () => {
        let field = new StringFields({ trim: true });
        field.set(`${stringValue}   `);
        expect(field.get()).toBe(stringValue);
      });

      test('(-) trim disabled', () => {
        let field = new StringFields({ trim: false });
        field.set(`${stringValue}   `);
        expect(field.get()).toBe(`${stringValue}   `);
      });
    });

    describe('lowercase property', () => {
      test('(+) lowercase enabled', () => {
        let field = new StringFields({ lowercase: true });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue.toLowerCase());
      });

      test('(-) lowercase disabled', () => {
        let field = new StringFields({ lowercase: false });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue);
      });
    });

    describe('uppercase property', () => {
      test('(+) uppercase enabled', () => {
        let field = new StringFields({ uppercase: true });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue.toUpperCase());
      });

      test('(-) uppercase disabled', () => {
        let field = new StringFields({ uppercase: false });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue);
      });
    });

    describe('capitalize property', () => {
      /*
          * Reference for capitalizeFirstLetter
          * https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
          */
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      test('(+) capitalize enabled', () => {
        let field = new StringFields({ capitalize: true });
        field.set(stringValue);
        expect(field.get()).toBe(capitalizeFirstLetter(stringValue));
      });

      test('(-) capitalize disabled', () => {
        let field = new StringFields({ capitalize: false });
        field.set(stringValue);
        expect(field.get()).toBe(stringValue);
      });
    });
  });

  describe('validators test', () => {
    describe('match validator', () => {
      let regularExpression = /ing/g;

      test('(+) correct match', () => {
        let field = new StringFields({ match: regularExpression });
        field.set('string');
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect match', () => {
        let field = new StringFields({ match: regularExpression });
        field.set('other');
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key is not valid');
      });
    });

    describe('maxLength validator', () => {
      test('(+) correct maxLength', () => {
        let field = new StringFields({ maxLength: 10 });
        field.set('string');
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect maxLength', () => {
        let field = new StringFields({ maxLength: 3 });
        field.set('other');
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be max 3 length');
      });

      describe('enum validator', () => {
        test('(+) correct enum', () => {
          let field = new StringFields({ enum: ['MALE', 'FEMALE'] });
          field.set('MALE');
          expect(field.validate()).toBe(true);
          expect(field.getErrorMessage('key').length).toBe(0);
        });

        test('(-) incorrect enum', () => {
          let field = new StringFields({ enum: ['MALE', 'FEMALE'] });
          field.set('UNKNOWN');
          expect(field.validate()).toBe(false);
          expect(field.getErrorMessage('key').length).toBe(1);
          expect(field.getErrorMessage('key')[0]).toBe('key is not valid enum value');
        });
      });
    });

    describe('minLength validator', () => {
      test('(+) correct minLength', () => {
        let field = new StringFields({ minLength: 1 });
        field.set('string');
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect maxLength', () => {
        let field = new StringFields({ minLength: 10 });
        field.set('other');
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key should be min 10 length');
      });
    });

    describe('email validator', () => {
      test('(+) correct email', () => {
        let field = new StringFields({ email: true });
        field.set('foo@bar.com');
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect email', () => {
        let field = new StringFields({ email: true });
        field.set('foobar.com');
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key is not valid email');
      });
    });

    describe('enum validator', () => {
      test('(+) correct enum', () => {
        let field = new StringFields({ enum: ['MALE', 'FEMALE'] });
        field.set('MALE');
        expect(field.validate()).toBeTruthy();
        expect(field.getErrorMessage('key').length).toBe(0);
      });

      test('(-) incorrect enum', () => {
        let field = new StringFields({ enum: ['MALE', 'FEMALE'] });
        field.set('UNKNOWN');
        expect(field.validate()).toBeFalsy();
        expect(field.getErrorMessage('key').length).toBe(1);
        expect(field.getErrorMessage('key')[0]).toBe('key is not valid enum value');
      });
    });
  });
});
