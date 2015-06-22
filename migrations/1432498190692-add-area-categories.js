'use strict';

var r = require('../models/utils/thinky')().r;

var TABLE = 'area_category';
var NAME_INDEX = 'name';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run()
        .then(function () {
            r.table(TABLE)
                .indexCreate(NAME_INDEX)
                .run(next);
        });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
