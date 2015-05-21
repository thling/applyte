'use strict';

var _       = require('lodash');
var r       = require('./r')();
var schemas = require('./schemas');

const TABLE = 'schools';
const SCHEMA = schemas.schools;

var School = function (properties) {
    this._data = {};
    _.assign(this._data, _.pick(properties, _.keys(SCHEMA)));

    if (_.has(properties, 'id')) {
        this._data.id = properties.id;
    }
};

// Static methods

/**
 * Queries the database for matching ID
 *
 * @param   id  The id to search for
 * @return  Returns a new School object that is populated
 *          of the data found; otherwise, null is returned
 */
School.findById = function *(id) {
    var result = yield r.table(TABLE)
            .get(id)
            .run();

    return (result)? new School(result) : null;
};

// Getter and setters
School.prototype = {
    get id() {
        return this._data.id;
    },
    get name() {
        return this._data.name;
    },
    set name(value) {
        this._data.name = value;
    },
    get phone() {
        return this._data.phone;
    },
    set phone(value) {
        this._data.phone = value;
    },
    get email() {
        return this._data.email;
    },
    set email(value) {
        this._data.email = value;
    },
    get address() {
        return this._data.address;
    },
    set address(value) {
        _.assign(this._data.address, value);
    },
    get links() {
        return this._data.links;
    },

    /**
     * Returns a generator function that iterates through the links list
     *
     * @return  Generator function
     */
    get linksIter() {
        return function *() {
            for (var i = 0; i < this._data.links.length; i++) {
                yield this._data.links[i];
            }
        };
    },
    set links(value) {
        // TODO: Add validation
        this._data.links = value;
    },
    get data() {
        return this._data;
    },
};

/**
 * Add a new link to this school. If the link already existsed,
 * it will be overwritten.
 *
 * @param   name    The name of the new link
 * @param   url     The link to add
 */
School.prototype.addLink = function (linkName, linkUrl) {
    this._data.links.push({
        name: linkName,
        url: linkUrl
    });
};

/**
 * Update the entire object to match the properties.
 * The properties configuration will be validated, and
 * unwanted properties will be discarded.
 *
 * @param   properties  The new property to assign to this object
 */
School.prototype.update = function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    var data = _.pick(properties, _.keys(SCHEMA));

    // Make sure the address only contain the fields we want
    if (_.has(data.address)) {
        data.address = _.pick(data.address, _.keys(SCHEMA.address));
    }

    _.assign(this._data, data);
};

/**
 * Save changes to the database. The method will detect
 * whether this object has an id already; if so, it will
 * perform db update; otherwise, it will insert the data.
 *
 * @return  True if save is success; false otherwise.
 */
School.prototype.save = function *() {
    var result, data;

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

module.exports = School;
