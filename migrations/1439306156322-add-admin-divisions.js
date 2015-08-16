'use strict';

let basedir = '../';
let co      = require('co');
let r       = require(basedir + 'config/thinky')().r;

let TABLE = 'adminDivision';
let NAME_INDEX = 'name';
let ABBREV_INDEX = 'abbrev';
let COUNTRY_INDEX = 'country';
let SUBDIVISION_INDEX = 'subdivision';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE).run();
        yield r.table(TABLE).indexCreate(NAME_INDEX).run();
        yield r.table(TABLE).indexCreate(ABBREV_INDEX).run();
        yield r.table(TABLE).indexCreate(COUNTRY_INDEX).run();
        yield r.table(TABLE).indexCreate(
                SUBDIVISION_INDEX,
                [
                    r.row('name'),
                    r.row('country')
                ]
        );
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
