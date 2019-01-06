const { ObjectIdFields } = require('../../lib/fields/BasicFields');

describe('ObjectIdFields', () => {
  describe('basic field', () => {
    test('set and get test', () => {
      let field = new ObjectIdFields();
      field.set('5c3193f0d877cd17885b17d6');
      expect(field._isValid(field.get())).toBe(true);
    });
  });
});
