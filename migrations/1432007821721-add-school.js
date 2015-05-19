'use strict';

var r = require('../models/r')();
var tableName = 'schools';

module.exports.up = function(next) {
    r.tableCreate(tableName)
        .run(next);
};

module.exports.down = function(next) {
    r.tableDrop(tableName)
        .run(next);
};
