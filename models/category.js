'use strict';

let _       = require('lodash');
let r       = require('./r')();
let schemas = require('./schemas');

const TABLE = 'area_categories';
const NAME_INDEX = 'name';
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

/**
 * Get the corrresponding category of the specified ID
 *
 * @param   id  The Id of the category to retireve
 * @return  The category object with the specified ID
 */
Category.findById = function *(id) {
    let result, ret = null;

    try {
        result = yield r.table(TABLE)
                .get(id)
                .run();

        if (result) {
            ret = new Category(result);
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
};

/**
 * Get the categories with the name
 *
 * @param   name    The name to search for
 * @return  A category object of the found category
 */
Category.findByName = function *(name) {
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
            // First check if name already existed
            let foundName = yield Category.findByName(this._data.name);
            if (!_.isNull(foundName)) {
                // If name already existed
                console.error('Name "' + this.name + ' already existed');

                // Set the id if name already existed
                this._data.id = foundName.id;
            } else {
                // Otherwise, insert this data
                result = yield r.table(TABLE)
                        .insert(data)
                        .run();

                // Verify result, and store ID in this object
                if (result && result.inserted === 1) {
                    this._data.id = result.generated_keys[0];
                }
            }
        }
    } catch (error) {
        console.error(error);
    }

    return (result)? true: false;
};

module.exports = Category;
