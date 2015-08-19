'use strict';

let _      = require('lodash');
let schema = require('./schemas/faculty-schema');
let thinky = require(basedir + 'config/thinky')();
let utils  = require(basedir + 'lib/utils');

const TABLE = 'faculty';
const FULLNAME_INDEX = 'name';

let Faculty = thinky.createModel(TABLE, schema, {
    // No extra fields allowed
    enforce_extra: 'strict'
});

Faculty.ensureIndex(FULLNAME_INDEX, function (doc) {
    return doc('name')('first')
            .add(doc('name')('middle'))
            .add(doc('name')('last'));
});

/**
 * Find faculty by ID
 *
 * @param   id  The id of the faculty to get
 * @return  The faculty object matching the given id
 */
Faculty.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield Faculty.get(id);
    } catch(error) {
        console.error(error.message);
    }

    return result;
});

/**
 * Find faculty by his/her full name. If only two parameters are given,
 * The first one will be used as firstname and the second will be used
 * as last name. At least 2 parameters are needed.
 *
 * @param   first   The first name
 * @param   middle  The middle name
 * @param   last    The last name
 * @return  The array of faculties matching the name
 */
Faculty.defineStatic('findByFullname', function *(first, middle, last) {
    if (!last) {
        last = middle;
        middle = '';
    }

    let result = [];

    try {
        result = yield Faculty.getAll(
                [first, middle, last],
                { index: FULLNAME_INDEX }
        );
    } catch (error) {
        console.error(error.message);
    }

    return result;
});

Faculty.define('update', function (properties) {
    let data = _.omit(properties, 'id');
    utils.assignDeep(this, data);
});

Faculty.pre('save', function (next) {
    if (!this.name.first) {
        next(new Error('Firstname is required'));
    } else if (!this.name.last) {
        next(new Error('Lastname is required'));
    } else {
        this.name.middle = this.name.middle || '';
        next();
    }
});

module.exports = Faculty;
