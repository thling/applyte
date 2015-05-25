'use strict';

var r        = require('../models/r')();

var TABLE = 'area_categories';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run(next);
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
