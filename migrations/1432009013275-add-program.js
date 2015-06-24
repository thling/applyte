'use strict';

let r = require('../models/utils/thinky')().r;

let TABLE = 'program';
let LEVEL_INDEX = 'level';
let NAME_INDEX = 'name';

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