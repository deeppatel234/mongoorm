const Mongoorm = require('../mongoorm');
const logger = require('../../lib/base/Logger');

describe('Logger Tests', () => {
  test('call custom logger functions', () => {
    let info = jest.fn();
    let error = jest.fn();
    Mongoorm.setLogger({
      info,
      error,
    });
    logger.info();
    logger.error();
    expect(info).toBeCalled();
    expect(error).toBeCalled();
  });
});
