'use strict';

let co = require('co');
let r  = require('../models/utils/thinky')().r;

let TABLE = 'school';
let NAME_CAMPUS_INDEX = 'name_campus';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE).run();

        yield r.table(TABLE)
            .indexCreate(NAME_CAMPUS_INDEX, [
                r.row('name'),
                r.row('campus')
            ]).run();
    })
    .then(next)
    .catch(function (error) {
        console.error(error);
    });
};

exports.down = function (next) {
    r.tableDrop(TABLE)
        .run(next);
};
