'use strict';

let basedir = '../';
let config  = require(basedir + 'config');
let r       = require(basedir + 'config/thinky')().r;

exports.up = function (next) {
    if (r.dbList().contains(config.rethink.db)) {
        next();
    } else {
        r.dbCreate(config.rethink.db)
            .run(next);
    }
};

exports.down = function (next) {
    r.dbDrop(config.rethink.db)
        .run(next);
};
