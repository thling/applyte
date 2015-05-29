'use strict';

let _       = require('lodash');
let thinky  = require('./thinky')();
let schemas = require('./schemas');

let r = thinky.r;

const TABLE  = 'programs';
const LEVEL_INDEX = 'level';
const NAME_INDEX = 'name';
const SCHEMA = schemas[TABLE];


let Program = thinky.createModel(TABLE, SCHEMA, {
    enforce_extra: 'strict'
});

/**
 * Queries the database for matching ID
 *
 * @param   id  The id to search for
 * @return  Returns a new program object that is populated
 *          of the data found; otherwise, null is returned
 */
Program.defineStatic('findById', function *(id) {
    let result;

    try {
        result = yield Program.get(id);
    } catch (error) {
        console.error(error);
    }

    return (result)? new Program(result) : null;
});

/**
 * Find programs that contain the specified name
 *
 * @param   name    The name to search for
 * @return  An array of programs that has the specified string in the name
 */
Program.defineStatic('findByName', function *(name) {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .filter(function (prog) {
                    // Return those with matching names
                    return prog('name').match('.*' + name + '.*');
                })
                .run();

        for (let prog of result) {
            ret.push(new Program(prog));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
});

/**
 * Get all the programs with area names that contain the specified string.
 *
 * @param   areaName    The name of the area to search for
 * @return  An array of programs with area names of the specified string
 */
Program.defineStatic('findByAreaName', function *(areaName) {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
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

        // Create an array for return
        for (let res of result) {
            ret.push(new Program(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
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

    let result, ret = [];
    try {
        result = yield r.table(TABLE)
                .filter(function (prog) {
                    // Return all programs whose categories field has what we want
                    return prog('areas')('categories').contains(function (cat) {
                        // r.args will generate a special object for
                        // ReQL functions that accept variable arguments
                        return cat.contains(r.args(categories));
                    });
                })
                .run();

        for (let res of result) {
            ret.push(new Program(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
});

/**
 * Return all programs of the specified level
 *
 * @param   level   The leve of the programs to fund
 * @return  Array of programs of the level
 */
Program.defineStatic('findByLevel', function *(level) {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .getAll(level, { index: LEVEL_INDEX })
                .run();
    } catch (error) {
        console.error(error);
    }

    // Create a array of Programs
    for (let res of result) {
        ret.push(new Program(res));
    }

    return ret;
});

/**
 * Get all the programs. Use of this function is not recommended.
 *
 * @return  Array of program objects
 */
Program.defineStatic('getAllPrograms', function *() {
    let result, ret = [];

    try {
        result = yield r.table(TABLE)
                .orderBy({ index: NAME_INDEX })
                .run();

        for (let res of result) {
            ret.push(new Program(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
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
Program.defineStatic('getProgramsRange', function *(start, length, desc) {
    let result, ret = [];
    let orderIndex = (desc)? r.desc(NAME_INDEX) : NAME_INDEX;

    try {
        result = yield r.table(TABLE)
                .orderBy({ index: orderIndex })
                .slice(start, start + length)
                .run();

        for (let res of result) {
            ret.push(new Program(res));
        }
    } catch (error) {
        console.error(error);
    }

    return ret;
});


Program.define('areasIter', function () {
    let areas = this.areas;
    return function *() {
        for (let area of areas) {
            yield area;
        }
    };
});

Program.define('addArea', function (name, categories) {
    if (!_.isArray(this.areas)) {
        this.areas = [];
    }

    this.areas.push({
        name: name,
        categories: categories
    });
});

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
    if (_.has(data.contact)) {
        data.contact = _.pick(data.contact, _.keys(SCHEMA.contact));
        if (_.has(data.contact.address)) {
            data.contact.address = _.pick(
                    data.contact.address,
                    _.keys(SCHEMA.contact.address)
            );
        }
    }

    _.assign(this, data);
});

/**
 * Save changes to the database. The method will detect
 * whether this object has an id already; if so, it will
 * perform db update; otherwise, it will insert the data.
 *
 * @return  True if save is success; false otherwise.
 */
// Program.prototype.save = function *() {
//     let result, data;
//
//     // Retrieve only data we specified in SCHEMA
//     data = _.pick(this._data, _.keys(SCHEMA));
//
//     try {
//         if (this._data.id) {
//             // If there is an ID, update the data
//             result = yield r.table(TABLE)
//                     .get(this._data.id)
//                     .update(data)
//                     .run();
//         } else {
//             // If there is no ID yet, insert this data
//             result = yield r.table(TABLE)
//                     .insert(data)
//                     .run();
//
//             // Verify result, and store ID in this object
//             if (result && result.inserted === 1) {
//                 this._data.id = result.generated_keys[0];
//             }
//         }
//     } catch (error) {
//         console.error(error);
//     }
//
//     return (result)? true : false;
// };

module.exports = Program;
