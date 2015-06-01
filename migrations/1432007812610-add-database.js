'use strict';

var config = require('../config');
var r      = require('../models/thinky')().r;

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
