var logger = require('./logger');
var mongoorm = require('../index')
// MONGO ORM
var db = mongoorm.db;

var dbConfig = {
    url: "mongodb://localhost:27017",
    name: "test"
}

mongoorm.setLogger({
    info: logger.info,
    error: logger.error
});

mongoorm.db.connect(dbConfig, function (err) {
    if (err) {
        logger.error('Error in DB Connection : ', err);
    }
});
