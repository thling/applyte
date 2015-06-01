'use strict';

var r = require('../models/thinky')().r;

var TABLE = 'schools';
var NAME_INDEX = 'name_campus_index';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run()
        .then(function () {
            r.table(TABLE)
                .indexCreate(NAME_INDEX, [
                    r.row('name'),
                    r.row('campus')
                ])
                .run(next);
        });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
