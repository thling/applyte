'use strict';

let basedir = '../';
let co      = require('co');
let r       = require(basedir + 'config/thinky')().r;

let TABLE = 'faculty';
let FULLNAME_INDEX = 'name';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE).run();
        yield r.table(TABLE)
            .indexCreate(FULLNAME_INDEX, [
                r.row('name')('first'),
                r.row('name')('middle'),
                r.row('name')('last')
            ])
            .run();
    })
    .then(next)
    .catch(function (error) {
        console.error(error.message);
    });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
