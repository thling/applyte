'use strict';

let r = require('../models/utils/thinky')().r;

let TABLE = 'user';
let FULLNAME_INDEX = 'fullname';
let EMAIL_INDEX = 'email';

exports.up = function (next) {
    r.tableCreate(TABLE)
        .run()
        .then(function () {
            return r.table(TABLE)
                .indexCreate(FULLNAME_INDEX, [
                    r.row('name')('first'),
                    r.row('name')('middle'),
                    r.row('name')('last')
                ])
                .run();
        })
        .then(function () {
            return r.table(TABLE)
                .indexCreate(EMAIL_INDEX, function (doc) {
                    return doc('contact')('email');
                })
                .run(next);
        });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
