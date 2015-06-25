'use strict';

let r = require('../models/utils/thinky')().r;

let TABLE = 'user';
let FULLNAME_INDEX = 'fullname';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run()
        .then(function () {
            r.table(TABLE)
                .indexCreate(FULLNAME_INDEX, [
                    r.row('name')('first'),
                    r.row('name')('middle'),
                    r.row('name')('last')
                ])
                .run(next);
        });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
