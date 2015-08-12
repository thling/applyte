'use strict';

let _      = require('lodash');
let schema = require('./schemas/city-schema');
let thinky = require(basedir + 'config/thinky')();
let utils  = require(basedir + 'lib/utils');

const TABLE = 'city';
let NAME_INDEX = 'name';
let ADMIN_DIVISION_ID_INDEX = 'adminDivisionId';
let SUBDIVISION_INDEX = 'subdivision';
let COUNTRY_INDEX = 'country';

let City = thinky.createModel(TABLE, schema, {
    // No extra fields allowed
    enforce_extra: 'strict'
});

City.ensureIndex(NAME_INDEX);
City.ensureIndex(COUNTRY_INDEX);
City.ensureIndex(ADMIN_DIVISION_ID_INDEX);
City.ensureIndex(SUBDIVISION_INDEX, function (doc) {
    return doc('adminDivision').add(doc('country'));
});

City.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield City.get(id);
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

City.defineStatic('findByName', function *(name) {
    let result = [];

    try {
        result = yield City.getAll(name, { index: NAME_INDEX }).run();
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

/**
 * Find by subdivision - administrative division + country
 *
 * @param   adminDivision   The administrative division to search
 * @param   country         The country of the adminDivision to search
 * @return  An array of found cities
 */
City.defineStatic('findBySubdivision', function *(adminDivision, country) {
    let result = [];

    try {
        result = yield City.getAll(
                [adminDivision, country],
                { index: SUBDIVISION_INDEX }
        )
        .run();
    } catch (error) {
        console.error(error.message);
    }

    return result;
});

City.defineStatic('findByAdminDivisionId', function *(adminDivisionId) {
    let result = [];

    try {
        result = yield City.getAll(
                adminDivisionId,
                { index: ADMIN_DIVISION_ID_INDEX }
        )
        .run();
    } catch (error) {
        console.error(error.message);
    }

    return result;
});

City.defineStatic('findByCountry', function *(country) {
    let result = [];

    try {
        result = yield City.getAll(country, { index: COUNTRY_INDEX }).run();
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

City.define('update', function (properties) {
    let data = _.omit(properties, 'id');
    utils.assignDeep(this, data);
});

City.pre('save', function (next) {
    if (!this.adminDivision) {
        this.adminDivision = '';
    }

    next();
});

module.exports = City;
