'use strict';

let basedir = '../';
let config  = require(basedir + 'config');
let r       = require(basedir + 'config/thinky')().r;

exports.up = function (next) {
    // Do nothing, thinky will create the table for us
    // upon initializing
    next();
};

exports.down = function (next) {
    r.dbDrop(config.rethink.db)
        .run(next);
};
