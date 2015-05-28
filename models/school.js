'use strict';

let _       = require('lodash');
let Program = require('./program');
let r       = require('./r')();
let schemas = require('./schemas');

const TABLE = 'schools';
const NAME_INDEX = 'name_campus_index';
const SCHEMA = schemas[TABLE];

let School = function (properties) {
    this._data = {};
    _.assign(this._data, _.pick(properties, _.keys(SCHEMA)));

    if (_.has(properties, 'id')) {
        this._data.id = properties.id;
    }
};

School.getTable = function () {
    return TABLE;
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
    let result;

    try {
        result = yield r.table(TABLE)
                .get(id)
                .run();
    } catch (error) {
        console.error(error);
    }

    return (result)? new School(result) : null;
};

/**
 * Find all schools that contain the name
 *
 * @param   name    The name of the school
 * @return  An array of schools that has the specified string in the name
 */
School.findByName = function *(name) {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .filter(
                    r.row('name').match('.*' + name + '.*')
                )
                .run();

        for (let res of result) {
            ret.push(new School(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
};

/**
 * Find schools that satisfy the location constraints
 *
 * @param   location    An object with one or more of the following properties:
 *                          {
 *                              address1: 'anything',
 *                              address2: 'anything',
 *                              city: 'anything',
 *                              state: 'anything',
 *                              postalCode: 'anything',
 *                              country: 'anything'
 *                          }
 *                      Any missing field will NOT be tested.
 *                      Regular expression is NOT supported.
 * @return  An array of school objects satisfying the location constraints.
 */
School.findByLocation = function *(location) {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .filter({
                    address: location
                })
                .run();

        for (let res of result) {
            ret.push(new School(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
};

/**
 * Get all the schools. Use is not recommended.
 *
 * @return  Array of school objects
 */
School.getAllSchools = function *() {
    // TODO: Support for pagination
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .orderBy({ index: NAME_INDEX })
                .run();

        for (let res of result) {
            ret.push(new School(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
};

/**
 * Returns the schools in the specified index range (page), starting from
 * start-th item (inclusive) to (start + length)-th item (exclusive).
 *
 * This is sorted by name + campus, alphabetically.
 *
 * @param   start   Start index
 * @param   length  The number of items to fetch beginning from start index
 * @param   desc    True to sort descendingly; false to sort ascendingly
 * @return  An array of school objects that fall into the range
 */
School.getSchoolsRange = function *(start, length, desc) {
    let result, ret = [];
    let orderIndex = (desc)? r.desc(NAME_INDEX) : NAME_INDEX;

    try {
        result = yield r.table(TABLE)
                // Using our compound index on [name, campus]
                .orderBy({ index: orderIndex })
                .slice(start, start + length)
                .run();

        for (let res of result) {
            ret.push(new School(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
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
    get campus() {
        return this._data.campus;
    },
    set campus(value) {
        this._date.campus = value;
    },
    get desc() {
        return this._data.desc;
    },
    set desc(value) {
        this._data.desc = value;
    },
    get email() {
        return this._data.email;
    },
    set email(value) {
        this._data.email = value;
    },
    get phone() {
        return this._data.phone;
    },
    set phone(value) {
        this._data.phone = value;
    },
    get logo() {
        return this._data.logo;
    },
    set logo(value) {
        this._data.logo = value;
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
            for (let link of this._data.links) {
                yield link;
            }
        };
    },
    set links(value) {
        // TODO: Add validation
        this._data.links = value;
    },
    get data() {
        return this._data;
    }
};

/**
 * Get all the programs that belong to this school
 *
 * @return  Array of programs
 */
School.prototype.getAllPrograms = function *() {
    return yield this.getProgramsWith({ schoolId: this.id });
};

/**
 * Return all programs that satisfy the condition.
 *
 * @param   condition   JSON object or function using ReQL
 * @return  Array of programs that satisfy the specified condition
 */
School.prototype.getProgramsWith = function *(condition) {
    if (!_.isObject(condition) && !_.isFunction(condition)) {
        throw 'Invalid condition specification; expected Object or Function';
    }

    let result, ret = [];
    let query = r.table(Program.getTable());

    // If condition is an object and does not filter by id yet,
    // or if condition is a function using ReQL, add new id filter
    if ((_.isObject(condition) && !_.has(condition, 'schoolId'))
            || _.isFunction(condition)) {
        query = query.filter({ schoolId: this.id });
    }

    try {
        result = yield query.filter(condition).run();
    } catch (error) {
        console.error(error);
    }

    // Create a new program for each of the result
    for (let prog of result) {
        ret.push(new Program(prog));
    }

    return ret;
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
 * Remvoes a link from the school
 *
 * @param   linkName    The name of the link to remove
 */
School.prototype.removeLink = function(linkName) {
    _.remove(this._data.links, function (obj) {
        return obj.name === linkName;
    });
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
School.prototype.update = function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));

    // Make sure the address only contain the fields we want
    if (_.has(data, 'address')) {
        this.address = _.pick(data.address, _.keys(SCHEMA.address));
        data = _.omit(data, 'address');
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

module.exports = School;
