'use strict';

var rethinkdb = require('rethinkdbdash');
var config    = require('../config');

var r;

module.exports = function (dbOptions) {
    dbOptions = dbOptions || config.rethink;

    // Create connection if not existed
    if (!r) {
        r = rethinkdb(dbOptions);
    }

    // Return the database object
    return r;
};
