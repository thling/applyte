'use strict';

let _      = require('lodash');
let schema = require('./schemas/country-schema');
let thinky = require(basedir + 'config/thinky')();
let utils  = require(basedir + 'lib/utils');

const TABLE = 'country';
const ABBREV_INDEX = 'abbrev';

let Country = thinky.createModel(TABLE, schema, {
    // No extra fields allowed
    enforce_extra: 'strict'
});

Country.ensureIndex(ABBREV_INDEX);

Country.defineStatic('findByName', function *(name) {
    let result = null;

    try {
        result = yield Country.get(name);
    } catch(error) {
        console.error(error);
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
