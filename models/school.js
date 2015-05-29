'use strict';

let _       = require('lodash');
let Program = require('./program');
let schemas = require('./schemas');
let thinky  = require('./thinky')();

let r = thinky.r;

const TABLE = 'schools';
const NAME_INDEX = 'name_campus_index';
const SCHEMA = schemas[TABLE];

let School = thinky.createModel(TABLE, SCHEMA, {
    enforce_extra: 'strict'
});

/**
 * Queries the database for matching ID
 *
 * @param   id  The id to search for
 * @return  Returns a new School object that is populated
 *          of the data found; otherwise, null is returned
 */
School.defineStatic('findById', function *(id) {
    let result;

    try {
        result = yield School.get(id);
    } catch (error) {
        console.error(error);
    }

    return (result)? new School(result) : null;
});

/**
 * Find all schools that contain the name
 *
 * @param   name    The name of the school
 * @return  An array of schools that has the specified string in the name
 */
School.defineStatic('findByName', function *(name) {
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
});

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
School.defineStatic('findByLocation', function *(location) {
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
});

/**
 * Get all the schools. Use of this is not recommended.
 *
 * @return  Array of school objects
 */
School.defineStatic('getAllSchools', function *() {
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
});

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
School.defineStatic('getSchoolsRange', function *(start, length, desc) {
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
});

/**
 * Get all the programs that belong to this school
 *
 * @return  Array of programs
 */
School.define('getAllPrograms', function *() {
    return yield this.getProgramsWith({ schoolId: this.id });
});

/**
 * Return all programs that satisfy the condition.
 *
 * @param   condition   JSON object or function using ReQL
 * @return  Array of programs that satisfy the specified condition
 */
School.define('getProgramsWith', function *(condition) {
    if (!_.isObject(condition) && !_.isFunction(condition)) {
        throw 'Invalid condition specification; expected Object or Function';
    }

    let result, ret = [];
    let query = r.table(Program.getTableName());

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
});

/**
 * Add a new link to this school. If the link already existsed,
 * it will be overwritten.
 *
 * @param   name    The name of the new link
 * @param   url     The link to add
 */
School.define('addLink', function (linkName, linkUrl) {
    this.links.push({
        name: linkName,
        url: linkUrl
    });
});

/**
 * Remvoes a link from the school
 *
 * @param   linkName    The name of the link to remove
 */
School.define('removeLink', function(linkName) {
    _.remove(this.links, function (obj) {
        return obj.name === linkName;
    });
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
School.define('update', function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));//thinky.getSchema(School));

    // Make sure the address only contain the fields we want
    if (_.has(data, 'address')) {
        this.address = _.pick(data.address, _.keys(SCHEMA.address));
        data = _.omit(data, 'address');
    }

    _.assign(this, data);
});

/**
 * Returns a generator function for the links array
 *
 * @return  A generator function for the links array
 */
School.define('linksIter', function () {
    let links = this.links;
    return function *() {
        for (let link of links) {
            yield link;
        }
    };
});

module.exports = School;
