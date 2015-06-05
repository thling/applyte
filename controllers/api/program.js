'use strict';

let _       = require('lodash');
let Program = require(basedir + 'models/program');

/**
 * Lists all the programs we have
 *
 * Method: GET
 * Base URL: /api/program/list/...
 *
 * Supports pagination. The url should be:
 *      [host]/api/program/list/
 *      [host]/api/program/list/[start]/[length]
 *      [host]/api/program/list/[start]/[length]/[desc]
 *
 * where [start] is the starting index (starting from 1) of the program,
 *       [length] is the number of programs to fetch,
 *       [desc] is the order to sort (by name)
 *              It is either "desc" for sorting descendingly or nothing.
 *              If nothing, default to sorting ascendingly.
 *
 * @return  200: sets the response object to JSON representation of found
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.listPrograms = function *() {
    try {
        if (this.params.start && this.params.length) {
            // Pagination requests
            let start = parseInt(this.params.start) - 1;
            let length = parseInt(this.params.length);

            if (!_.isFinite(start) || !_.isFinite(length)) {
                this.status = 400;
                this.body = {
                    error: 'Invalid start/length',
                    reqParams: this.params
                };
            } else {
                let order = (this.params.order === 'desc')? true : false;

                // Obtain the result
                let result = yield Program.getProgramsRange(start, length, order);

                this.status = 200;
                this.body = result;
            }
        } else {
            let result = yield Program.getAllPrograms();
            this.body = result;
            this.status = 200;
        }
    } catch (error) {
        console.error(error);
        this.status = 500;
    }
};

/**
 * Gets the program by ID
 *
 * Method: GET
 * Base URL: /api/program/id/[id]
 *
 * @return  200: sets the response object to JSON representation of found
 *               Single object
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.getProgramById = function *() {
    let data = this.params;

    if (!data.id) {
        this.status = 400;
        this.body = {
            error: 'No ID to search for',
            reqParams: this.params
        };
    } else {
        try {
            let program = yield Program.get(data.id);
            this.status = 200;
            this.body = program;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Gets the program by name
 *
 * Method: GET
 * Base URL: /api/program/name/[name]
 *
 * @return  200: sets the response object to JSON representation of found
 *               Array of object(s)
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.getProgramsByName = function *() {
    let data = this.params;

    if (!data.name) {
        this.status = 400;
        this.body = {
            error: 'No name to search for',
            reqParams: this.params
        };
    } else {
        let name = decodeURI(data.name);

        try {
            let programs = yield Program.findByName(name);
            this.status = 200;
            this.body = programs;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Gets programs with areas that fall into the specified categories
 *
 * Method: GET
 * Base URL: /api/program/categories/[categories]
 *      Can specify multiple categories by using delimiter ||
 *
 * @return  200: sets the response object to JSON representation of found
 *               Array of object(s)
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.getProgramsByAreaCategories = function *() {
    let data = this.params;

    if (!data.categories) {
        this.status = 400;
        this.body = {
            error: 'No category specified',
            reqParams: this.params
        };
    } else {
        let categories = decodeURI(data.categories).split('||');

        try {
            let programs = yield Program.findByAreaCategories(categories);
            this.status = 200;
            this.body = programs;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Creates a new program and returns a new ID for the program
 *
 * Method: POST
 * Base URL: /api/program/create
 *
 * Accepts JSON object that complies with Program schema.
 *
 * @return  201: Successfully created
 *               An object with one property named "id"
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.createProgram = function *() {
    let data = this.request.body;
    if (data.id) {
        this.status = 400;
        this.body = {
            error: 'Cannot create if ID is know or existed',
            reqParams: this.request.body
        };
    } else {
        // Create a new program and try to save it
        let program = new Program(this.request.body);

        try {
            yield program.save();
            this.status = 201;
            this.body = {
                success: 'created',
                id: program.id
            };
        } catch (error) {
            // If save failed, return server error
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Updates the program specified with id
 *
 * Method: PUT
 * Base URL: /api/program/update
 *
 * Accepts JSON object that complies with Program schema
 *
 * @return  200: Successfully updated, and a changelog in the format of
                    {
                        id: program_id,
                        new: { new values },
                        old: { old values }
                    }
 *          400: Bad request, e.g. no ID specified
 *          500: Either update error or specified ID not existed
 */
module.exports.updateProgram = function *() {
    let data = this.request.body;

    if (!data.id) {
        this.status = 400;
        this.body = {
            error: 'Cannot update without known id',
            reqParams: this.request.body
        };
    } else {
        try {
            // Sanitize in case this is used as fabrication
            let newData = _.omit(data, 'id');
            let program = yield Program.get(data.id);
            let oldValue = _.pick(program, _.keys(newData));

            // Need to set as saved before updating
            program.setSaved();
            program.update(newData);
            yield program.save();

            let newValue = _.pick(program, _.keys(newData));

            this.status = 200;
            this.body = {
                id: program.id,
                new: newValue,
                old: oldValue
            };
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Deletes a program given the ID
 *
 * Method: DELETE
 * Base URL: /api/program/delete
 *
 * Accepts JSON object is of the following format:
 *      {
 *          apiKey: key_string
 *          id: program_id
 *      }
 * (specification subject to changes)
 *
 * @return  204: Successfully deleted
 *          400: sets the resposne object to error text (displaying error)
 *          403: sets the response object to "Forbidden"
 *          500: sets the response object to error text (hiding error)
 */
module.exports.deleteProgram = function *() {
    let data = this.request.body;

    // Implement apikey for critical things like this in the future
    // Since this is experimental, we'll make sure this is never possible
    // on production server
    if (!data.apiKey || process.env.NODE_ENV === 'production') {
        this.status = 403;
        this.body = {
            error: 'Permission denied'
        };
    } else {
        if (!data.id) {
            // Bad request
            this.status = 400;
            this.body = {
                error: 'No ID to delete',
                reqParams: this.request.body
            };
        } else {
            try {
                let program = yield Program.findById(data.id);

                // Need to set saved before delete
                program.setSaved();
                yield program.delete();

                this.status = 204;
                this.body = {
                    success: 'deleted',
                    id: data.id
                };
            } catch (error) {
                this.status = 500;
                console.error(error);
            }
        }
    }
};
