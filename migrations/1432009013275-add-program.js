'use strict';

let basedir = '../';
let co      = require('co');
let r       = require(basedir + 'config/thinky')().r;

let TABLE = 'program';
let LEVEL_INDEX = 'level';
let NAME_INDEX = 'name';
let SCHOOL_ID_INDEX = 'schoolId';
let TAGS_INDEX = 'tags';
let RANKING_INDEX = 'rank';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE).run();

        yield r.table(TABLE).indexCreate(LEVEL_INDEX).run();
        yield r.table(TABLE).indexCreate(NAME_INDEX).run();
        yield r.table(TABLE).indexCreate(SCHOOL_ID_INDEX).run();
        yield r.table(TABLE).indexCreate(TAGS_INDEX, { multi: true });
        yield r.table(TABLE).indexCreate(RANKING_INDEX, function (doc) {
            return doc('ranking')('rank');
        }).run();
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
