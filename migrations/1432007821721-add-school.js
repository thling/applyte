'use strict';

var r = require('../models/r')();
var TABLE = 'schools';

module.exports.up = function(next) {
    r.tableCreate(TABLE)
        .run(next);
};

module.exports.down = function(next) {
    r.tableDrop(TABLE)
        .run(next);
};
