'use strict';

var config = require('../config');
var r      = require('../models/r')();

exports.up = function(next) {
    r.dbCreate(config.rethink.db)
        .run(next);
};

exports.down = function(next) {
    r.dbDrop(config.rethink.db)
        .run(next);
};
