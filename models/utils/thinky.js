'use strict';

var thinkyOrm = require('thinky');
var config    = require('../../config');

var thinky;

module.exports = function (dbOptions) {
    dbOptions = dbOptions || config.rethink;

    // Create connection if not existed
    if (!thinky) {
        thinky = thinkyOrm(dbOptions);
    }

    // Return the database object
    return thinky;
};
