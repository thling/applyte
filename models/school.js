'use strict';

let _       = require('lodash');
// let Program = require('./program');
let schemas = require('./utils/schemas');
let thinky  = require('./utils/thinky')();

let r = thinky.r;

const TABLE = 'school';
const NAME_CAMPUS_INDEX = 'name_campus';
const SCHEMA = schemas[TABLE];

let School = thinky.createModel(TABLE, SCHEMA, {
    enforce_extra: 'strict'
});

// Create index if not existed;
School.ensureIndex(NAME_CAMPUS_INDEX, function (doc) {
    return doc('name').add(doc('campus'));
});

/**
 * Queries the database for matching ID. This will alleviate
 * the impact of exception thrown by Thinky by returning null
 * on not found; if you would like to handle exception, use
 * School.get(id).
 *
 * @param   id  The id to search for
 * @return  Returns a new School object that is populated
 *          of the data found; otherwise, null is returned
 */
School.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield School.get(id);
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Find all schools that contain the name
 *
 * @param   name    The name of the school
 * @return  An array of schools that has the specified string in the name
 */
School.defineStatic('findByName', function *(name) {
    let result = [];

    try {
        result = yield School
                .filter(
                    r.row('name').match('.*' + name + '.*')
                )
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Get the school by name + campus. This makes up an unique identifier,
 * so only 1 school object will be returned.
 *
 * @param   name    The name of the school
 * @param   campus  The campus name under the school
 * @return  A school object
 */
School.defineStatic('findByNameCampus', function *(name, campus) {
    let result = null;

    try {
        result = yield School
                .getAll([name, campus], { index: NAME_CAMPUS_INDEX })
                .run();

        if (result.length === 1) {
            result = result[0];
        }
    } catch (error) {
        console.error(error);
    }

    return result;
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
    let result = [];

    try {
        result = yield School
                .filter({
                    address: location
                })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Get all the schools. Use of this is not recommended.
 *
 * @return  Array of school objects
 */
School.defineStatic('getAllSchools', function *() {
    let result = [];

    try {
        result = yield School
                .orderBy({ index: NAME_CAMPUS_INDEX })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
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
    let result = [];
    let orderIndex = (desc)? r.desc(NAME_CAMPUS_INDEX) : NAME_CAMPUS_INDEX;

    try {
        result = yield School
                // Using our compound index on [name, campus]
                .orderBy({ index: orderIndex })
                .slice(start, start + length)
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Gets the school's full name - its name + its campus name
 *
 * @return  The name + campus identifier for ths school
 */
School.define('getFullName', function () {
    return this.name + ' ' + this.campus;
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
School.define('removeLink', function (linkName) {
    _.remove(this.links, function (obj) {
        return obj.name === linkName;
    });
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
    let data = _.pick(properties, _.keys(SCHEMA));

    // Make sure the address only contain the fields we want
    if (_.has(data, 'address')) {
        let newAddress = _.pick(data.address, _.keys(SCHEMA.address));
        _.assign(this.address, newAddress);

        data = _.omit(data, 'address');
    }

    _.assign(this, data);
});

module.exports = School;
