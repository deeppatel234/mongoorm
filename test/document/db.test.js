const mongoorm = require('../mongoorm');

const { Document } = mongoorm;

const mlabdbConfig = {
  url: 'mongodb://test:test123@ds113648.mlab.com:13648/mongoormtest',
  name: 'mongoormtest',
};

beforeAll(() => mongoorm.db.connect(mlabdbConfig));

afterAll(() => mongoorm.db.close());

class Student extends Document {
  constructor() {
    super();
    this.documentName = 'student';
  }

  initFields(fields) {
    return {
      name: fields.String(),
    };
  }
}

const student = new Student();

describe('Save Record', () => {
  test('save test', async () => {
    expect.assertions(1);
    let rec = student.create({ name: 'deep' });
    await rec.save();
    expect(rec.name.get()).toBe('deep');
  });
});
