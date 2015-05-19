'use strict';

var r = require('../models/r')();
var tableName = 'programs';

module.exports.up = function(next) {
    r.tableCreate(tableName)
        .run(next);
};

module.exports.down = function(next) {
    r.tableCreate(tableName)
        .run(next);
};
