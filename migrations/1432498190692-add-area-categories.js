'use strict';

let co = require('co');
let r  = require('../models/utils/thinky')().r;

let TABLE = 'area_category';
let NAME_INDEX = 'name';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(TABLE).run();
        yield r.table(TABLE).indexCreate(NAME_INDEX).run();
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
