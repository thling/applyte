'use strict';

var r = require('../models/utils/thinky')().r;

var TABLE = 'school';
var NAME_INDEX = 'name_campus';

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
