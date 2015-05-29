'use strict';

let _       = require('lodash');
let thinky  = require('./thinky')();
let schemas = require('./schemas');

let r = thinky.r;

const TABLE = 'area_categories';
const NAME_INDEX = 'name';
const SCHEMA = schemas[TABLE];

let Category = thinky.createModel(TABLE, SCHEMA, {
    enforce_extra: 'strict'
});

/**
 * Get the corrresponding category of the specified ID
 *
 * @param   id  The Id of the category to retireve
 * @return  The category object with the specified ID
 */
Category.defineStatic('findById', function *(id) {
    let result, ret = null;

    try {
        result = yield Category.get(id);

        if (result) {
            ret = new Category(result);
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
});

/**
 * Get the categories with the name
 *
 * @param   name    The name to search for
 * @return  A category object of the found category
 */
Category.defineStatic('findByName', function *(name) {
    let result, ret = null;

    try {
        result = yield r.table(TABLE)
                .getAll(name, { index: NAME_INDEX })
                .run();

        if (result.length === 1) {
            ret = new Category(result[0]);
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
});


/**
 * Update the entire object to match the properties.
 * The properties configuration will be validated, and
 * unwanted properties will be discarded.
 *
 * This function does not persist the data to database yet;
 * you need to call 'save()'.
 *
 * @param   properties  The new property to assign to this object
 */
Category.define('update', function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));
    _.assign(this, data);
});

module.exports = Category;
