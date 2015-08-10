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

Faculty.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield Faculty.get(id);
    } catch(error) {
        console.error(error);
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
    }

    if (!this.name.last) {
        next(new Error('Lastname is required'));
    }

    this.name.middle = this.name.middle || '';
    this.name.prefix = this.name.prefix || '';
    next();
});

module.exports = Faculty;
