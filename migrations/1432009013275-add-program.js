'use strict';

var r = require('../models/thinky')().r;

var TABLE = 'programs';
var LEVEL_INDEX = 'level';
var NAME_INDEX = 'name';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run()
    .then(function () {
        r.table(TABLE)
            .indexCreate(LEVEL_INDEX)
            .run()
        .then(function () {
            r.table(TABLE)
                .indexCreate(NAME_INDEX)
                .run(next);
        });
    });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
