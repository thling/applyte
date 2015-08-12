'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// AdminDivision schema
module.exports = {
    id: type.string(),
    name: type.string(),
    abbrev: type.string(),
    country: type.string()
};
