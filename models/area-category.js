'use strict';

let _       = require('lodash');
let schemas = require('./utils/schemas');
let thinky  = require('./utils/thinky')();

let r = thinky.r;

const TABLE = 'area_category';
const NAME_INDEX = 'name';
const SCHEMA = schemas[TABLE];

let AreaCategory = thinky.createModel(TABLE, SCHEMA, {
    enforce_extra: 'strict'
});

// Create index if not existed
AreaCategory.ensureIndex(NAME_INDEX);

/**
 * Queries the database for matching ID. This will alleviate
 * the impact of exception thrown by Thinky by returning null
 * on not found; if you would like to handle exception, use
 * AreaCategory.get(id)
 *
 * @param   id  The Id of the AreaCategory to retireve
 * @return  The AreaCategory object with the specified ID
 */
AreaCategory.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield AreaCategory.get(id);
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Get the categories with the name
 *
 * @param   name    The name to search for
 * @return  A AreaCategory object of the found AreaCategory
 */
AreaCategory.defineStatic('findByName', function *(name) {
    let result = null;

    try {
        result = yield AreaCategory
                .filter(
                    r.row('name').match('.*' + name + '.*')
                )
                .run();

        if (!_.isEmpty(result)) {
            result = result[0];
        }
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Get all the area categories
 *
 * @return  An array of AreaCategory objects
 */
AreaCategory.defineStatic('getAllAreaCategories', function *() {
    let result = [];

    try {
        result = yield AreaCategory
                .orderBy({ index: NAME_INDEX })
                .run();

    } catch (error) {
        console.error(error);
    }

    return result;
});

AreaCategory.defineStatic('getAreaCategoriesRange', function *(start, length, desc) {
    let result = [];
    let orderIndex = (desc)? r.desc(NAME_INDEX) : NAME_INDEX;

    try {
        result = yield AreaCategory
                .orderBy({ index: orderIndex })
                .slice(start, start + length)
                .run();
    } catch (error) {
        console.log(error);
    }

    return result;
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
AreaCategory.define('update', function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));
    _.assign(this, data);
});

module.exports = AreaCategory;
