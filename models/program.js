'use strict';

let _       = require('lodash');
let schemas = require('./utils/schemas');
let School  = require('./school');
let thinky  = require('./utils/thinky')();

let r = thinky.r;

const TABLE  = 'program';
const LEVEL_INDEX = 'level';
const NAME_INDEX = 'name';
const SCHOOL_ID_INDEX = 'schoolId';
const SCHEMA = schemas[TABLE];

let Program = thinky.createModel(TABLE, SCHEMA, {
    // No extra fields allowed
    enforce_extra: 'strict'
});

// Create indices if not existed
Program.ensureIndex(LEVEL_INDEX);
Program.ensureIndex(NAME_INDEX);
Program.ensureIndex(SCHOOL_ID_INDEX);

// Enforce relationship
Program.belongsTo(School, 'school', 'schoolId', 'id');

/**
 * Queries the database for matching ID. This will alleviate
 * the impact of exception thrown by Thinky by returning null
 * on not found; if you would like to handle exception, use
 * Program.get(id).
 *
 * @param   id  The id to search for
 * @return  Returns a new program object that is populated
 *          of the data found; otherwise, null is returned
 */
Program.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield Program.get(id);
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Find programs that contain the specified name
 *
 * @param   name    The name to search for
 * @return  An array of programs that has the specified string in the name
 */
Program.defineStatic('findByName', function *(name) {
    let result = [];

    try {
        result = yield Program
                .filter(function (prog) {
                    // Return those with matching names
                    return prog('name').match('.*' + name + '.*');
                })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Get all the programs with area names that contain the specified string.
 *
 * @param   areaName    The name of the area to search for
 * @return  An array of programs with area names of the specified string
 */
Program.defineStatic('findByAreaName', function *(areaName) {
    let result = [];

    try {
        result = yield Program
                .filter(function (obj) {
                    return obj('areas').contains(
                        // We need to use contains because areas is an array,
                        // we cannot directly access the object property
                        function (area) {
                            return area('name').match('.*' + areaName + '.*');
                        }
                    );
                })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Find programs with areas that fall into the specified categories
 *
 * @param   categories  Name of the category/categories. Can be a string
 *                      or an array of strings
 * @return  An array of programs with areas that fall into the
 *          specified categories
 */
Program.defineStatic('findByAreaCategories', function *(categories) {
    if (_.isString(categories)) {
        // Wrap as array if it is a single string
        categories = [categories];
    }

    let result = [];

    try {
        result = yield Program
                .filter(function (prog) {
                    // Return all programs whose categories field has what we want
                    return prog('areas')('categories').contains(function (cat) {
                        // r.args will generate a special object for
                        // ReQL functions that accept variable arguments
                        return cat.contains(r.args(categories));
                    });
                })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Return all programs of the specified level
 *
 * @param   level   The leve of the programs to find
 * @return  Array of programs of the level
 */
Program.defineStatic('findByLevel', function *(level) {
    let result = [];

    try {
        result = yield Program
                .getAll(level, { index: LEVEL_INDEX })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Get all the programs. Use of this function is not recommended.
 *
 * @return  Array of program objects
 */
Program.defineStatic('getAllPrograms', function *() {
    let result = [];

    try {
        result = yield Program
                .orderBy({ index: NAME_INDEX })
                .run();
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Returns all programs and their corresponding school object
 * embedded.
 *
 * @return  An array of objects like Program, with objects like School
 *          embedded into the 'school' property, e.g.
 *              returnedProgram = {
 *                  id: ...,
 *                  name: 'Computer Science',
 *                  areas: [ ... ],
 *                  ...
 *                  school: {
 *                      id: ...,
 *                      name: 'Purdue University',
 *                      campus: 'West Lafayette',
 *                      ...
 *                  }
 *              }
 *
 *          Note that schoolId will be removed.
 */
Program.defineStatic('getAllProgramsWithSchool', function *() {
    let result = [];

    try {
        result = yield Program.getJoin().without('schoolId');
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Returns all programs belong to the school specified by schoolId.
 *
 * @param   schoolId    The id of the school
 * @return  All programs under teh school specified by the schoolId
 */
Program.defineStatic('getProgramsBySchoolId', function *(schoolId) {
    let result = [];
    try {
        result = yield Program
                .getAll(schoolId, { index: SCHOOL_ID_INDEX })
                .run();
    } catch (error) {
        console.log(error);
    }

    return result;
});

/**
 * Returns the programs in the specified index range (page), starting from
 * start-th item (inclusive) to (start + length)-th item (exclusive).
 *
 * This is sorted by name + campus, alphabetically.
 *
 * @param   start   Start index
 * @param   length  The number of items to fetch beginning from start index
 * @param   desc    True to sort descendingly; false to sort ascendingly
 * @return  An array of program objects that fall into the range
 */
Program.defineStatic('getProgramsByRange', function *(start, length, desc) {
    let result = [];
    let orderIndex = (desc) ? r.desc(NAME_INDEX) : NAME_INDEX;

    try {
        result = yield Program
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
 *                  standard object, NOT Program model object
 *          hasMore: true if there are more data; false otherwise
 *      }
 */
Program.defineStatic('query', function *(query) {
    let q = r.table(TABLE);
    let pagination = query.pagination;
    let school = query.school;
    let tempQuery = _.pick(query, _.keys(SCHEMA));
    let areas;

    if (tempQuery.areas) {
        areas = tempQuery.areas;
        tempQuery = _.omit(tempQuery, 'areas');
    }

    // Determine the desired sorting index
    let queryChained = false, useIndex;
    switch (pagination.sort) {
        default:
            useIndex = (pagination.order === 'desc') ?
                    r.desc(NAME_INDEX) : NAME_INDEX;

            if (tempQuery.name) {
                q = q.getAll(tempQuery.name, { index: useIndex });
                queryChained = true;
                tempQuery = _.omit(tempQuery, 'name');
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

    // Filter areas
    if (areas) {
        let areaFilters, init = true;

        // For each area listed, construct an 'or' predicate
        for (let area of areas) {
            if (init) {
                init = false;
                areaFilters = r.row('areas')('name').contains(area);
            } else {
                areaFilters = areaFilters.or(r.row('areas')('name').contains(area));
            }
        }

        q = q.filter(areaFilters);
    }

    // Paginate; request for one more entry to see if there are more data
    q = q.slice(pagination.start, pagination.start + pagination.limit + 1);

    if (query.fields) {
        // Remove unwanted fields
        query.fields = _.intersection(query.fields, _.keys(SCHEMA));
        q = q.pluck(query.fields);
    }

    // If the user requests to include school in the result
    if (school) {
        q = q.merge(function (prog) {
            return {
                school: r.table(School.getTableName()).get(prog('schoolId'))
            };
        });
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
 * Returns a generator function for iterating through the program's areas
 *
 * @return  A generator function that iterates through this program's areas
 */
Program.define('areasIter', function () {
    let areas = this.areas;
    return function *() {
        for (let area of areas) {
            yield area;
        }
    };
});

/**
 * Add an area to this program
 *
 * @param   name        The name of the new area
 * @param   categories  The categories this area may fall into.
 *                      Each category must already exist in the
 *                      area_categories table in database (will be verified).
 */
Program.define('addArea', function (name, categories) {
    if (!_.isArray(this.areas)) {
        this.areas = [];
    }

    this.areas.push({
        name: name,
        categories: categories
    });
});

/**
 * Removes an area from the program
 *
 * @param   name    The name of the area to remove
 */
Program.define('removeArea', function (name) {
    _.remove(this.areas, function (obj) {
        return obj.name === name;
    });
});

/**
 * Updates this program object. Note this this function
 * does not save to database, you need to call save().
 *
 * @param   properties  An object with new values to update this program with
 */
Program.define('update', function (properties) {
    // TODO: Add validation

    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));

    // Make sure the address only contain the fields we want
    if (_.has(data, 'contact')) {
        data.contact = _.pick(data.contact, _.keys(SCHEMA.contact));

        if (_.has(data, 'contact.address')) {
            let newAddress = _.pick(
                    data.contact.address,
                    _.keys(SCHEMA.contact.address)
            );

            _.assign(this.contact.address, newAddress);
            data.contact = _.omit(data.contact, 'address');
        }

        _.assign(this.contact, data.contact);
        data = _.omit(data, 'contact');
    }

    if (_.has(data, 'areas')) {
        for (let area of data.areas) {
            area = _.pick(area, _.keys(SCHEMA.areas[0]));
        }
    }

    _.assign(this, data);
});

module.exports = Program;
