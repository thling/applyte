'use strict';

var _       = require('lodash');
var schemas = require('./schemas');
var r       = require('./r')();

const TABLE = 'schools';
const SCHEMA = schemas.schools;

var School = function (properties) {
    _.assign(this, properties);
};

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

// Getters

School.prototype.getName = function () {
    return this.name;
};

School.prototype.getPhone = function () {
    return this.phone;
};

School.prototype.getEmail = function () {
    return this.email;
};

School.prototype.getLinks = function () {
    return this.links;
};

School.prototype.getAddress = function () {
    return this.address;
};

School.prototype.getId = function () {
    return this.id;
};

// Setters

School.prototype.setPhone = function (number) {
    this.number = number;
};

School.prototype.setEmail = function (email) {
    this.email = email;
};

School.prototype.setAddress = function (address) {
    _.assign(this.address, address);
};

/**
 * Add a new link to this school. If the link already existsed,
 * it will be overwritten.
 *
 * @param   name    The name of the new link
 * @param   url     The link to add
 */
School.prototype.addLink = function (name, url) {
    this.links[name] = url;
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

    _.assign(this, data);
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
    data = _.pick(this, _.keys(SCHEMA));

    try {
        if (this.getId()) {
            // If there is an ID, update the data
            result = yield r.table(TABLE)
                    .get(this.getId())
                    .update(data)
                    .run();
        } else {
            // If there is no ID yet, insert this data
            result = yield r.table(TABLE)
                    .insert(data)
                    .run();

            // Verify result, and store ID in this object
            if (result && result.inserted === 1) {
                this.id = result.generated_keys[0];
            }
        }
    } catch (error) {
        console.error(error);
    }

    return (result)? true: false;
};

module.exports = School;
