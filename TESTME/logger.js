// LOGGER
var winston = require('winston')

const tsFormat = () => (new Date())

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true
    })
  ]
})
logger.level = 'debug'

module.exports = logger
