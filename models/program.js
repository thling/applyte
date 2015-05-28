'use strict';

let _       = require('lodash');
let r       = require('./r')();
let schemas = require('./schemas');

const TABLE  = 'programs';
const LEVEL_INDEX = 'level';
const NAME_INDEX = 'name';
const SCHEMA = schemas[TABLE];

let Program = function (properties) {
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
 * @return  Returns a new program object that is populated
 *          of the data found; otherwise, null is returned
 */
Program.findById = function *(id) {
    let result;

    try {
        result = yield r.table(TABLE)
                .get(id)
                .run();
    } catch (error) {
        console.error(error);
    }

    return (result)? new Program(result) : null;
};

/**
 * Find programs that contain the specified name
 *
 * @param   name    The name to search for
 * @return  An array of programs that has the specified string in the name
 */
Program.findByName = function *(name) {
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
};

/**
 * Get all the programs with area names that contain the specified string.
 *
 * @param   areaName    The name of the area to search for
 * @return  An array of programs with area names of the specified string
 */
Program.findByAreaName = function *(areaName) {
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
};

/**
 * Find programs with areas that fall into the specified categories
 *
 * @param   categories  Name of the category/categories. Can be a string
 *                      or an array of strings
 * @return  An array of programs with areas that fall into the
 *          specified categories
 */
Program.findByAreaCategories = function *(categories) {
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
};

/**
 * Get all the programs. Use of this function is not recommended.
 *
 * @return  Array of program objects
 */
Program.getAllPrograms = function *() {
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
};

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
Program.getProgramsRange = function *(start, length, desc) {
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
    get department() {
        return this._data.department;
    },
    set department(value) {
        this._data.department = value;
    },
    get faculty() {
        return this._data.faculty;
    },
    set faculty(value) {
        this._data.faculty = value;
    },
    get areas() {
        return this._data.areas;
    },
    get areasIter() {
        return function *() {
            for (let area of this._data.areas) {
                yield area;
            }
        };
    },
    set areas(value) {
        // TODO: Add validation
        this._data.areas = value;
    },
    get contact() {
        return this._data.contact;
    },
    set contact(value) {
        this._data.contact = value;
    }
};

Program.prototype.addArea = function (name, categories) {
    if (!_.isArray(this._data.areas)) {
        this._data.areas = [];
    }

    this._data.areas.push({
        name: name,
        categories: categories
    });
};

Program.prototype.removeArea = function (name) {
    _.remove(this._data.areas, function (obj) {
        return obj.name === name;
    });
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

    return (result)? true : false;
};

module.exports = Program;
