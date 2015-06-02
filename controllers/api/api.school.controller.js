'use strict';

let _      = require('lodash');
let School = require(basedir + 'models/school');
let Program = require(basedir + 'models/program');

/**
 * Lists all the schools we have
 *
 * Method: GET
 * Base URL: /api/school/list/...
 *
 * Supports pagination. The url should be:
 *      [host]/api/school/list/
 *      [host]/api/school/list/[start]/[length]
 *      [host]/api/school/list/[start]/[length]/[desc]
 *
 * where [start] is the starting index (starting from 1) of the school,
 *       [length] is the number of school to fetch,
 *       [desc] is the order to sort (by name then campus name)
 *              It is either "desc" for sorting descendingly or nothing.
 *              If nothing, default to sorting ascendingly.
 *
 * @return  200: sets the response object to JSON representation of found
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.listSchools = function *() {
    try {
        if (this.params.start && this.params.length) {
            // Pagination requests
            let start = parseInt(this.params.start) - 1;
            let length = parseInt(this.params.length);

            if (!_.isFinite(start) || !_.isFinite(length)) {
                this.status = 400;
                this.body = 'Invalid start/length';
            } else {
                let order = (this.params.order === 'desc')? true : false;

                // Obtain the result
                let result = yield School.getSchoolsRange(start, length, order);

                this.status = 200;
                this.body = result;
            }
        } else {
            let result = yield School.getAllSchools();
            this.body = result;
            this.status = 200;
        }
    } catch (error) {
        console.error(error);
        this.status = 500;
    }
};

/**
 * Gets the school by ID
 *
 * Method: GET
 * Base URL: /api/school/id/[id]
 *
 * @return  200: sets the response object to JSON representation of found
 *               Single object
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.getSchoolById = function *() {
    let data = this.params;

    if (!data.id) {
        this.status = 400;
        this.body = 'No ID to search for';
    } else {
        try {
            let school = yield School.get(data.id);
            this.status = 200;
            this.body = school;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Gets the school by ID
 *
 * Method: GET
 * Base URL: /api/school/name/[name]
 *
 * @return  200: sets the response object to JSON representation of found
 *               Array of object(s)
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.getSchoolByName = function *() {
    let data = this.params;

    if (!data.name) {
        this.status = 400;
        this.body = 'No name to search for';
    } else {
        let name = decodeURI(data.name);

        try {
            let schools = yield School.findByName(name);
            this.status = 200;
            this.body = schools;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Gets all the program the school has
 *
 * Method: GET
 * Base URL: /api/school/id/[id]/programs
 *
 * @return  200: sets the response object to JSON representation of found
 *               Array of object(s)
 *          400: sets the resposne object to error text (displaying error)
 *          500: not returning anything in response body (hiding error)
 */
module.exports.getSchoolPrograms = function *() {
    let data = this.params;
    if (!data.id) {
        this.status = 400;
        this.body = 'No id to search for';
    } else {
        try {
            let school = yield School.get(data.id);
            let programs = yield school.getAllPrograms();

            this.status =200;
            this.body = programs;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Creates a new school and returns a new ID for the school
 *
 * Method: POST
 * Base URL: /api/school/create
 *
 * Accepts JSON object that complies with School schema.
 *
 * @return  201: Successfully created
 *               An object with one property named "id"
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
 */
module.exports.createSchool = function *() {
    let data = this.request.body;
    if (data.id) {
        this.status = 400;
        this.body = 'Cannot create if ID is know or existed';
    } else {
        // Create a new school and try to save it
        let school = new School(this.request.body);

        try {
            yield school.save();
            this.status = 201;
            this.body = { id: school.id };
        } catch (error) {
            // If save failed, return server error
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Updates the school specified with id
 *
 * Method: PUT
 * Base URL: /api/school/update
 *
 * Accepts JSON object that complies with School schema
 *
 * @return  200: Successfully updated, and a changelog in the format of
                    {
                        id: school_id,
                        new: { new values },
                        old: { old values }
                    }
 *          400: Bad request, e.g. no ID specified
 *          500: Either update error or specified ID not existed
 */
module.exports.updateSchool = function *() {
    let data = this.request.body;

    if (!data.id) {
        this.status = 400;
        this.body = 'Cannot update without known id';
    } else {
        try {
            // Sanitize in case this is used as fabrication
            let newData = _.omit(data, 'id');
            let school = yield School.get(data.id);
            let oldValue = _.pick(school, _.keys(newData));

            // Need to set as saved before updating
            school.setSaved();
            school.update(newData);
            yield school.save();

            let newValue = _.pick(school, _.keys(newData));

            this.status = 200;
            this.body = {
                id: school.id,
                old: oldValue,
                new: newValue
            };
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Deletes a school given the ID
 *
 * Method: DELETE
 * Base URL: /api/school/delete
 *
 * Accepts JSON object is of the following format:
 *      {
 *          apiKey: key_string
 *          id: school_id
 *      }
 * (specification subject to changes)
 *
 * @return  204: Successfully deleted
 *          400: sets the resposne object to error text (displaying error)
 *          403: sets the response object to "Forbidden"
 *          500: sets the response object to error text (hiding error)
 */
module.exports.deleteSchool = function *() {
    let data = this.request.body;

    // Implement apikey for critical things like this in the future
    // Since this is experimental, we'll make sure this is never possible
    // on production server
    if (!data.apiKey || process.env.NODE_ENV === 'production') {
        this.status = 403;
    } else {
        if (!data.id) {
            // Bad request
            this.status = 400;
            this.body = 'No ID to delete';
        } else {

            try {
                let school = yield School.findById(data.id);

                // Need to set saved before delete
                school.setSaved();
                yield school.delete();

                this.status = 204;
            } catch (error) {
                this.status = 500;
                console.error(error);
            }
        }
    }
};
