const MongoUtils = require('../../lib/base/MongoUtils');

describe('Mongo Utils', () => {
  describe('object to dot notation object', () => {
    test('simple obj2dot', () => {
      expect(MongoUtils.obj2dot({ a: 1, b: { c: 2 } })).toMatchObject({ a: 1, 'b.c': 2 });
    });

    test('objectid obj2dot', () => {
      expect(MongoUtils.obj2dot({ a: 1, b: { _bsontype: 'ObjectID' } })).toMatchObject({ a: 1, b: { _bsontype: 'ObjectID' } });
    });

    test('complex obj2dot', () => {
      const obj = {
        a: 1,
        b: {
          c: 3,
          d: {
            e: {
              j: 6,
              f: {
                g: {
                  h: 4,
                },
              },
            },
          },
        },
      };
      expect(MongoUtils.obj2dot(obj)).toMatchObject({
        a: 1, 'b.c': 3, 'b.d.e.f.g.h': 4, 'b.d.e.j': 6,
      });
    });
  });
});
