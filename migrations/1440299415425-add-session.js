'use strict';

let basedir = '../';
let co     = require('co');
let config = require(basedir + 'config');
let thinky = require('thinky')({
    host: config.session.host,
    port: config.session.port,
    db: config.session.db
});

let r = thinky.r;

const SID_INDEX = 'sid';
const USERID_INDEX = 'userId';

exports.up = function (next) {
    co(function *() {
        yield r.tableCreate(config.session.table)
            .run();
        yield r.table(config.session.table)
            .indexCreate(SID_INDEX)
            .run();
        yield r.table(config.session.table)
            .indexCreate(USERID_INDEX)
            .run();
    })
    .catch(function (error) {
        console.error(error.message);
    })
    .then(next);
};

exports.down = function (next) {
    r.dbDrop(config.session.db)
        .run(next);
};
