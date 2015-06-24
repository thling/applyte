'use strict';

let r = require('../models/utils/thinky')().r;

let TABLE = 'school';
let NAME_CAMPUS_INDEX = 'name_campus';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run()
        .then(function () {
            r.table(TABLE)
                .indexCreate(NAME_CAMPUS_INDEX, [
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
