'use strict';

var r = require('../models/r')();
var TABLE = 'programs';

module.exports.up = function(next) {
    r.tableCreate(TABLE)
        .run(next);
};

module.exports.down = function(next) {
    r.tableCreate(TABLE)
        .run(next);
};
