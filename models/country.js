'use strict';

let _      = require('lodash');
let schema = require('./schemas/country-schema');
let thinky = require(basedir + 'config/thinky')();
let utils  = require(basedir + 'lib/utils');

const TABLE = 'country';
const ABBREV_INDEX = 'abbrev';

let Country = thinky.createModel(TABLE, schema, {
    pk: 'name', // Primary key is name
    enforce_extra: 'strict' // No extra fields allowed
});

Country.ensureIndex(ABBREV_INDEX);

Country.defineStatic('findByName', function *(name) {
    let result = null;

    try {
        result = yield Country.get(name);
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

Country.defineStatic('findByAbbrev', function *(abbrev) {
    let result = [];

    try {
        result = yield Country.getAll(abbrev, { index: ABBREV_INDEX });
    } catch (error) {
        console.error(error.message);
    }

    return result;
});

Country.define('update', function (properties) {
    let data = _.omit(properties, 'name');
    utils.assignDeep(this, data);
});

Country.pre('save', function (next) {
    if (!this.abbrev) {
        this.abbrev = '';
    }

    next();
});

module.exports = Country;
