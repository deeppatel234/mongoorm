<p align="center">
  <img src="assets/logo-title.png" width="75%"/>
</p>


<h2 align="center">ORM for Mongodb in Node JS </h2>

[![CircleCI](https://circleci.com/gh/deeppatel234/mongoorm/tree/master.svg?style=shield)](https://circleci.com/gh/deeppatel234/mongoorm/tree/master)
[![codecov](https://codecov.io/gh/deeppatel234/mongoorm/branch/master/graph/badge.svg)](https://codecov.io/gh/deeppatel234/mongoorm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Download](https://img.shields.io/npm/dt/mongoorm.svg)](https://www.npmjs.com/package/mongoorm)
[![NPM](https://img.shields.io/npm/v/mongoorm.svg)](https://www.npmjs.com/package/mongoorm)

## Installation

```sh
$ npm install mongoorm
```

## Connecting to MongoDB and configure mongoorm
```javascript
const MongoORM = require('mongoorm')

MongoORM.connect(connectionString, options).then(() => {
  console.log("mongoorm is connected.");
});
```

For more information on the connection options:

- [URI Connection String](docs/connection-string.md): MongoDB connection string URI.
- [Connection Settings](docs/connection-options.md): Reference on the driver-specific connection settings.

## Document Schema Creation

Schema can be created by extending `Document`

```javascript
const { Document } = mongoorm;

class User extends Document {
  initFields(fields) {
    return {
      firstName: fields.String(),
      lastName: fields.String(),
      address: {
        city: fields.String(),
        pin: fields.String(),
      },
    };
  }
}

```

## CRUD Operations
```javascript
//get collection
const user = new User({ document: 'user' });

//example data
let userData = {
  firstName: 'Deep',
  lastName: 'Patel',
  address: {
    city: 'Mehsana',
    pin: '384002',
  },
};

//create document with above data
let document = user.create(userData);

//create document
await document.save();

//update document
document.firstName.set('hello');
await document.save();

//delete document
await document.delete();
```

### Configure logging

You can configure your own logger using -

```javascript
mongoorm.setLogger({
  info: console.info,
  error: console.error,
});
```