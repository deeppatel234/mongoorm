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


    class Student extends mongoorm.Document {
        constructor () {
            super()
            this.documentName = "student"
            this.customFunctions = { upper: this.upper }
        }
        
        initFields (fields) {
            return {
                name: fields.String(),
                address: {
                    city: fields.String(),
                },
                abc: fields.String(),
            }
        }

        upper() {
            return this.name.get().toUpperCase()
        }
    }

    let s = new Student()

    s1 = s.create({name: 'deep', address: {city: 'meh'}})
    s1.address.city.markModified = false
    s1.save().then(function(result) {
        console.log('saved');
    }).catch(function (err) {
        console.log(err);
    })    
});
