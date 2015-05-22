'use strict';

var _       = require('lodash');
var r       = require('./r')();
var schemas = require('./schemas');

const TABLE  = 'programs';
const SCHEMA = schemas[TABLE];

var Program = function (properties) {
    this._data = {};
    _.assign(this._data, _.pick(properties, _.keys(SCHEMA)));

    if (_.has(properties, 'id')) {
        this._data.id = properties.id;
    }
};

Program.getTable = function () {
    return TABLE;
};

/**
 * Queries the database for matching ID
 *
 * @param   id  The id to search for
 * @return  Returns a new School object that is populated
 *          of the data found; otherwise, null is returned
 */
Program.findById = function *(id) {
    var result = yield r.table(TABLE)
            .get(id)
            .run();

    return (result)? new Program(result) : null;
};

/**
 * Return all programs of the specified level
 *
 * @param   level   The leve of the programs to fund
 * @return  Array of programs of the level
 */
Program.findByLevel = function *(level) {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .filter({level: level})
                .run();
    } catch (error) {
        console.error(error);
    }

    // Create a array of Programs
    for (let res of result) {
        ret.push(new Program(res));
    }

    return ret;
};

// Getters and setters
Program.prototype = {
    get id() {
        return this._data.id;
    },
    get name() {
        return this._data.name;
    },
    set name(value) {
        this._data.name = value;
    },
    get degree() {
        return this._data.degree;
    },
    set degree(value) {
        this._data.degree = value;
    },
    get level() {
        return this._data.level;
    },
    set level(value) {
        this._data.level = value;
    },
    get desc() {
        return this._data.desc;
    },
    set desc(value) {
        this._data.desc = value;
    },
    get schoolId() {
        return this._data.schoolId;
    },
    set schoolId(value) {
        this._data.schoolId = value;
    },
    get areas() {
        return this._data.areas;
    },
    get areasIter() {
        return function *() {
            for (var area of this._data.areas) {
                yield area;
            }
        };
    },
    set areas(value) {
        this._data.areas = value;
    },
    get contact() {
        return this._data.contact;
    },
    set contact(value) {
        this._data.contact = value;
    }
};

/**
 * Updates this program object. Note this this function
 * does not save to database, you need to call save().
 *
 * @param   properties  An object with new values to update this program with
 */
Program.prototype.update = function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    var data = _.pick(properties, _.keys(SCHEMA));

    // Make sure the address only contain the fields we want
    if (_.has(data.contact)) {
        data.contact = _.pick(data.contact, _.keys(SCHEMA.contact));
        if (_.has(data.contact.address)) {
            data.contact.address = _.pick(
                    data.contact.address,
                    _.keys(SCHEMA.contact.address)
            );
        }
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
Program.prototype.save = function *() {
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

    return (result)? true : false;
};

module.exports = Program;
