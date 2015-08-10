'use strict';

let thinkyOrm = require('thinky');
let config    = require('./');

let thinky;

module.exports = function (dbOptions) {
    dbOptions = dbOptions || config.rethink;

    // Create connection if not existed
    if (!thinky) {
        thinky = thinkyOrm(dbOptions);
    }

    // Return the database object
    return thinky;
};
