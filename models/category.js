'use strict';

let _       = require('lodash');
let r       = require('./r')();
let schemas = require('./schemas');

const TABLE = 'area_categories';
const SCHEMA = schemas[TABLE];

let Category = function (properties) {
    this._data = {};
    _.assign(this._data, _.pick(properties, _.keys(SCHEMA)));

    if (_.has(properties, 'id')) {
        this._data.id = properties.id;
    }
};

Category.getTable = function () {
    return TABLE;
};

Category.findById = function *(id) {
    let result;

    try {
        result = yield r.table(TABLE)
                .get(id)
                .run();
    } catch (error) {
        console.error(error);
    }

    return (result)? new Category(result) : null;
};

Category.findByName = function *(name) {

};

Category.prototype = {
    get id() {
        return this._data.id;
    },
    get name() {
        return this._data.name;
    },
    set name(value) {
        this._data.name = value;
    },
    get desc() {
        return this._data.desc;
    },
    set desc(value) {
        this._data.desc = value;
    }
};

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
Category.prototype.update = function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));
    _.assign(this._data, data);
};

/**
 * Save changes to the database. The method will detect
 * whether this object has an id already; if so, it will
 * perform db update; otherwise, it will insert the data.
 *
 * @return  True if save is success; false otherwise.
 */
Category.prototype.save = function *() {
    let result, data;

    // Retrieve only data we specified in SCHEMA
    data = _.pick(this._data, _.keys(SCHEMA));

    try {
        if (this._data.id) {
            // If there is an ID, update the data
            result = yield r.table(TABLE)
                    .get(this._data.id)
                    .update(data)
                    .run();
        } else {
            // If there is no ID yet, insert this data
            result = yield r.table(TABLE)
                    .insert(data)
                    .run();

            // Verify result, and store ID in this object
            if (result && result.inserted === 1) {
                this._data.id = result.generated_keys[0];
            }
        }
    } catch (error) {
        console.error(error);
    }

    return (result)? true: false;
};

module.exports = Category;
