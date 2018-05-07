const MongoUtils = require('../../lib/base/MongoUtils');

describe('Mongo Utils', () => {
  describe('object to dot notation object', () => {
    test('simple obj2dot', () => {
      expect(MongoUtils.obj2dot({ a: 1, b: { c: 2 } })).toMatchObject({ a: 1, 'b.c': 2 });
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

  describe('conditional extend function', () => {
    test('extend with true condition', () => {
      let obj = { a: 1 };
      MongoUtils.extend(obj, { b: 2 }, true);
      expect(obj).toMatchObject({ a: 1, b: 2 });
    });
    test('extend with false condition', () => {
      let obj = { a: 1 };
      MongoUtils.extend(obj, { b: 2 }, false);
      expect(obj).toMatchObject({ a: 1 });
    });
  });
});
