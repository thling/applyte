'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// City schema
module.exports = {
    id: type.string(),
    name: type.string(),
    adminDivision: type.string(),
    adminDivisionId: type.string(),
    country: type.string(),
    coordinates: type.point()
};
