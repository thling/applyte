'use strict';

let _      = require('lodash');
let schema = require('./schemas/admin-division-schema');
let thinky = require(basedir + 'config/thinky')();
let utils  = require(basedir + 'lib/utils');

const TABLE = 'adminDivision';
const NAME_INDEX = 'name';
const ABBREV_INDEX = 'abbrev';
const COUNTRY_INDEX = 'country';

let AdminDivision = thinky.createModel(TABLE, schema, {
    // No extra fields allowed
    enforce_extra: 'strict'
});

AdminDivision.ensureIndex(NAME_INDEX);
AdminDivision.ensureIndex(ABBREV_INDEX);
AdminDivision.ensureIndex(COUNTRY_INDEX);

AdminDivision.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield AdminDivision.get(id).run();
    } catch (error) {
        console.log(error.message);
    }

    return result;
});

AdminDivision.defineStatic('findByName', function *(name) {
    let result = [];

    try {
        result = yield AdminDivision.getAll(name, { index: NAME_INDEX }).run();
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

AdminDivision.defineStatic('findByAbbrev', function *(abbrev) {
    let result = [];

    try {
        result = yield AdminDivision.getAll(abbrev, { index: ABBREV_INDEX }).run();
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

AdminDivision.defineStatic('findByCountry', function *(country) {
    let result = [];

    try {
        result = yield AdminDivision.getAll(country, { index: COUNTRY_INDEX }).run();
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

AdminDivision.define('update', function (properties) {
    let data = _.omit(properties, 'name');
    utils.assignDeep(this, data);
});

AdminDivision.pre('save', function (next) {
    if (!this.abbrev) {
        // Make sure abbreviation is not null for index purposes
        this.abbrev = '';
    }

    next();
});

module.exports = AdminDivision;
