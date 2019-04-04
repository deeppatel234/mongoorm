const { ObjectIdField } = require('../../lib/fields/BasicFields');

describe('ObjectIdField', () => {
  describe('basic field', () => {
    test('set and get test', () => {
      let field = new ObjectIdField();
      field.set('5c3193f0d877cd17885b17d6');
      expect(field._isValid(field.get())).toBe(true);
    });
  });
});
