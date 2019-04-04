const MongoURI = require('../../lib/base/MognoURI');

describe('MongoURI Tests', () => {
  test('parsestring test (mongodb schema)', () => {
    const uriobj = MongoURI.parseString('mongodb://userName:passWorld@myurl.com:12345/mydb');
    expect(uriobj).toMatchObject({
      scheme: 'mongodb',
      username: 'userName',
      password: 'passWorld',
      database: 'mydb',
      hosts: [{ host: 'myurl.com', port: 12345 }],
    });
  });

  test('parsestring test (mongodb+srv schema)', () => {
    const uriobj = MongoURI.parseString('mongodb+srv://userName:passWorld@myurl.com:12345/mydb');
    expect(uriobj).toMatchObject({
      scheme: 'mongodb+srv',
      username: 'userName',
      password: 'passWorld',
      database: 'mydb',
      hosts: [{ host: 'myurl.com', port: 12345 }],
    });
  });

  test('parsestring multihost test', () => {
    const uriobj = MongoURI.parseString('mongodb://mongodb1.example.com:27317,mongodb2.example.com:27017/?replicaSet=mySet&authSource=authDB');
    expect(uriobj).toMatchObject({
      hosts: [{
        host: 'mongodb1.example.com',
        port: 27317,
      }, {
        host: 'mongodb2.example.com',
        port: 27017,
      }],
      options: {
        authSource: 'authDB',
        replicaSet: 'mySet',
      },
      scheme: 'mongodb',
    });
  });

  test('parseobject test (mongodb schema)', () => {
    const uristring = MongoURI.parseObject({
      scheme: 'mongodb',
      username: 'userName',
      password: 'passWorld',
      database: 'mydb',
      hosts: [{ host: 'myurl.com', port: 12345 }],
    });
    expect(uristring).toBe('mongodb://userName:passWorld@myurl.com:12345/mydb');
  });

  test('parseobject test (mongodb+srv schema)', () => {
    const uristring = MongoURI.parseObject({
      scheme: 'mongodb+srv',
      username: 'userName',
      password: 'passWorld',
      database: 'mydb',
      hosts: [{ host: 'myurl.com', port: 12345 }],
    });
    expect(uristring).toBe('mongodb+srv://userName:passWorld@myurl.com:12345/mydb');
  });

  test('parseobject multihost test', () => {
    const uristring = MongoURI.parseObject({
      hosts: [{
        host: 'mongodb1.example.com',
        port: 27317,
      }, {
        host: 'mongodb2.example.com',
        port: 27017,
      }],
      options: {
        authSource: 'authDB',
        replicaSet: 'mySet',
      },
      database: 'mydb',
      scheme: 'mongodb',
    });
    expect(uristring).toBe('mongodb://mongodb1.example.com:27317,mongodb2.example.com:27017/mydb?authSource=authDB&replicaSet=mySet');
  });
});
