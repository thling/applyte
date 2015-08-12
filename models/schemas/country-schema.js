'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// Country schema
module.exports = {
    name: type.string(),
    abbrev: type.string()
};
