'use strict';

let basedir = '../';
let co      = require('co');
let r       = require(basedir + 'config/thinky')().r;

let TABLE = 'country';
let ABBREV_INDEX = 'abbrev';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE, { primaryKey: 'name' }).run();
        yield r.table(TABLE).indexCreate(ABBREV_INDEX).run();
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
