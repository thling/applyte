'use strict';

let _      = require('lodash');
let schema = require('./schemas/school-schema');
let thinky = require(basedir + 'config/thinky')();
let utils  = require(basedir + 'lib/utils');

let r = thinky.r;

const TABLE = 'school';
const NAME_CAMPUS_INDEX = 'name_campus';

let School = thinky.createModel(TABLE, schema, {
    // No extra fields allowed
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
 *                              address: 'anything',
 *                              city: 'anything',
 *                              adminDivision: 'anything',
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
School.defineStatic('getSchoolsByRange', function *(start, length, order) {
    let result = [];
    let orderIndex = (order && order === 'desc') ?
            r.desc(NAME_CAMPUS_INDEX) : NAME_CAMPUS_INDEX;

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
 * Mega query composer for complex data filtering. Supports pagination.
 *
 * @param   query   The query boject
 * @return  An object of result and indicator:
 *      {
 *          results: array of found matching data in
 *                  standard object, NOT School model object
 *          hasMore: true if there are more data; false otherwise
 *      }
 */
School.defineStatic('query', function *(query) {
    let q = r.table(TABLE);
    let pagination = query.pagination;
    let tempQuery = _.pick(query, _.keys(schema));

    // Determine the desired sorting index
    let queryChained = false, useIndex;
    switch (pagination.sort) {
        default:
            useIndex = (pagination.order === 'desc') ?
                    r.desc(NAME_CAMPUS_INDEX) : NAME_CAMPUS_INDEX;

            if (tempQuery.name && tempQuery.campus) {
                q = q.getAll(
                    [tempQuery.name, tempQuery.campus],
                    { index: useIndex }
                );

                queryChained = true;
                tempQuery = _.omit(tempQuery, ['name', 'campus']);
            }
    }

    // If getAll has been chained, don't use orderBy
    if (!queryChained) {
        q = q.orderBy({ index: useIndex });
    }

    // Filter using the information we have
    if (tempQuery.length !== 0) {
        q = q.filter(tempQuery);
    }

    // Paginate; request for one more entry to see if there are more data
    q = q.slice(pagination.start, pagination.start + pagination.limit + 1);

    if (query.fields) {
        // Remove unwanted fields
        q = q.pluck(_.intersection(query.fields, _.keys(schema)));
    }

    // Actually execute query
    let result = [];
    try {
        result = yield q.run();
        let retData = {
            results: result.slice(0, pagination.limit),
            hasMore: result.length > pagination.limit
        };

        result = retData;
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
    // Make sure we only retrieve what we want
    let data = _.omit(properties, 'id');

    // Recursively assign data value
    utils.assignDeep(this, data);
});

module.exports = School;
