'use strict';

let basedir = '../';
let co      = require('co');
let r       = require(basedir + 'config/thinky')().r;

let TABLE = 'city';
let NAME_INDEX = 'name';
let ADMIN_DIVISION_ID_INDEX = 'adminDivisionId';
let SUBDIVISION_INDEX = 'subdivision';
let COUNTRY_INDEX = 'country';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE).run();
        yield r.table(TABLE).indexCreate(NAME_INDEX).run();
        yield r.table(TABLE).indexCreate(ADMIN_DIVISION_ID_INDEX).run();
        yield r.table(TABLE).indexCreate(COUNTRY_INDEX).run();
        yield r.table(TABLE)
            .indexCreate(SUBDIVISION_INDEX, [
                r.row('adminDivision'),
                r.row('country')
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
