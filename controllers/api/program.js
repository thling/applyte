'use strict';

let _       = require('lodash');
let Program = require(basedir + 'models/program');

/**
 * @api {get}   /api/program/list   List all programs
 * @apiName     getAllPrograms
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiUse  successProgramArray
 * @apiUse  errors
 */
module.exports.listPrograms = function *() {
    try {
        let programs = yield Program.getAllPrograms();
        this.status = 200;
        this.body = programs;
    } catch (error) {
        console.log(error);
        this.status = 500;
        this.body = { message: this.message };
    }
};

/**
 * @api {get}   /api/program/list/:start/:length  List all programs (paginated)
 * @apiName     getProgramsByRange
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiParam    {Number}        start       The index fo the program to begin listing from
 * @apiParam    {Number}        length      The number of programs to fetch from <code>start</code>
 * @apiParam    {String="desc"} [order]     Whether to fetch in descending order
 *
 * @apiUse  successProgramArray
 * @apiUse  errors
 */
module.exports.listProgramsByRange = function *() {
    let data = this.params;

    if (!data.start || !data.length) {
        this.status = 400;
        this.body = { message: 'Missing parameters: start or length'};
    } else {
        // Pagination requests
        let start = parseInt(data.start) - 1;
        let length = parseInt(data.length);

        if (!_.isFinite(start) || !_.isFinite(length)) {
            this.status = 400;
            this.body = { message: 'Invalid start or length value' };
        } else {
            let order = (this.params.order === 'desc')? true : false;

            try {
                let programs = yield Program.getProgramsRange(start, length, order);
                this.status = 200;
                this.body = programs;
            } catch (error) {
                console.error(error);
                this.status = 500;
                this.body = { message: this.message };
            }
        }
    }
};

/**
 * @api {get}   /api/program/id/:id      Get program by ID
 * @apiName     getProgramById
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    id  The ID of the program to retrieve
 *
 * @apiUse      successProgram
 *
 * @apiError    (404)   {json}  NotFound    The specified ID does not exist
 * @apiUse      errors
 */
module.exports.getProgramById = function *() {
    let data = this.params;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            let program = yield Program.findById(data.id);
            if (program) {
                this.status = 200;
                this.body = program;
            } else {
                this.status = 404;
                this.body = { message: this.message };
            }
        } catch (error) {
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {get}   /api/program/name/:name     Get programs by name
 * @apiName     getProgramsByName
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    name    The name to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI</code>.
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 */
module.exports.getProgramsByName = function *() {
    let data = this.params;

    if (!data.name) {
        this.status = 400;
        this.body = { message: 'Missing parameters: name' };
    } else {
        let name = decodeURI(data.name);

        try {
            let programs = yield Program.findByName(name);
            this.status = 200;
            this.body = programs;
        } catch (error) {
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {get}   /api/program/level/:level   Get programs by level
 * @apiName     getProgramsByLevel
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiParam    {String="Undergraduate","Graduate"} level
 *              The level to search for. This parameter must be encoded
 *              with <code>encodeURI</code>.
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 */
module.exports.getProgramsByLevel = function *() {
    let data = this.params;

    if (!data.level) {
        this.status = 400;
        this.body = { message: 'Missing parameters: level' };
    } else {
        let level = decodeURI(data.level);

        try {
            let programs = yield Program.findByLevel(level);
            this.status = 200;
            this.body = programs;
        } catch (error) {
            console.log(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {get}   /api/program/area/:areaName     Get programs by area name
 * @apiName     getProgramsByAreaName
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    areaName
 *              The area to search for. This parameter must be encoded
 *              with <code>encodeURI</code>.
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 */
module.exports.getProgramByAreaName = function *() {
    let data = this.params;

    if (!data.area) {
        this.status = 400;
        this.body = { message: 'Missing parameters: area' };
    } else {
        let areaName = decodeURI(data.area);

        try {
            let programs = yield Program.findByAreaName(areaName);
            this.status = 200;
            this.body = programs;
        } catch (error) {
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {get}   /api/program/categories/:categories     Get programs by categories
 * @apiName     getProgramsByCategories
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    categories  The categories to search for. Multiple
 *                                      categories should be separated with
 *                                      delimiter <code>||</code>. The final
 *                                      query string must also be encoded with
 *                                      <code>encodeURI()</code>
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 *
 * @apiParamExample {URL}   Request Example:
 *      https://applyte.io/api/program/categories/Database%7C%7CSecurity
 */
module.exports.getProgramsByAreaCategories = function *() {
    let data = this.params;

    if (!data.categories) {
        this.status = 400;
        this.body = { message: 'Missing parameters: categories' };
    } else {
        let categories = decodeURI(data.categories).split('||');

        try {
            let programs = yield Program.findByAreaCategories(categories);
            this.status = 200;
            this.body = programs;
        } catch (error) {
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {post}  /api/program/create     Create a new program
 * @apiName     createProgram
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiDescription  Creates a new program and returns the ID of the
 *                  newly created object. The optional parameters may be
 *                  tightened in the future release.
 *
 * @apiUse      paramProgram
 *
 * @apiSuccess  (201) {String}  success     "created"
 * @apiSuccess  (201) {String}  id          The ID of the newly created object
 *
 * @apiUse      errors
 */
module.exports.createProgram = function *() {
    let data = this.request.body;

    if (data.id) {
        this.status = 400;
        this.body = { message: 'Request will not be idempotent' };
    } else {
        // Create a new program and try to save it
        let program = new Program(this.request.body);

        try {
            yield program.save();
            this.status = 201;
            this.body = {
                message: this.message,
                id: program.id
            };
        } catch (error) {
            // If save failed, return server error
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {put}   /api/program/update     Updates an existing program
 * @apiName     updateProgram
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiDescription  Updates the Program object in the database with
 *                  the specified change. Invalid keys will be ignored and
 *                  objects will be replaced as is. On success, the ID of the
 *                  updated object and the changes (new value and old value)
 *                  will be returned.
 *
 * @apiParam    {String}    id  The ID of the program to update
 * @apiUse      paramProgram
 *
 * @apiSuccess  (200)   {String}    id      The ID of the updated object
 * @apiSuccess  (200)   {Object}    new     The new values
 * @apiSuccess  (200)   {Mixed}     new.UPDATED_PROPERTIES
 *                                          New values of the updated properties only
 * @apiSuccess  (200)   {Object}    old     The old values
 * @apiSuccess  (200)   {Mixed}     old.CHANGED_PROPERTIES
 *                                          Old values of the updated properties only
 * @apiUse      errors
 *
 * @apiSuccessExample   {json}  Response Example (Success):
 *          HTTP/1.1 200 OK
 *          {
 *              id: '103fa394-caca-4c1d-9374-f64d41dd52f6'
 *              new: {
 *                  name: 'Computer Science',
 *                  areas: [
 *                      {
 *                          name: 'Distributed Systems',
 *                          categories: ['Cloud Computing', 'Systems']
 *                      },
 *                      {
 *                          name: 'Information Security',
 *                          categories: ['Security']
 *                      }
 *                  ]
 *              },
 *              old: {
 *                  name: 'Computer and Information Technology',
 *                  areas: [
 *                      {
 *                          name: 'Databases'
 *                          categories: ['Databases', 'Systems']
 *                      }
 *                  ]
 *              }
 *          }
 */
module.exports.updateProgram = function *() {
    let data = this.request.body;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
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
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {delete}    /api/program/delete     Deletes an existing program
 * @apiName     deleteProgram
 * @apiGroup    Program
 * @apiVersion  0.0.1
 *
 * @apiDescription  Deletes an Program with specified ID. During testing,
 *                  any <code>access-token</code> will work; in production,
 *                  this API will reject anything as it is still in test.
 *
 * @apiHeader   {String}    acccess-token   The access token to execute
 *                                          delete action on the database
 *
 * @apiParam    {String}    id  The ID of the object to delete
 *
 * @apiSuccess  (204)   {String}    success     "deleted"
 * @apiSuccess  (204)   {String}    id          The ID of the deleted object
 * @apiError    (403)   {String}    error       "Permission denied"
 * @apiUse      errors
 */
module.exports.deleteProgram = function *() {
    let data = this.request.body;
    let header = this.request.headers;

    // Implement apikey for critical things like this in the future
    // Since this is experimental, we'll make sure this is never possible
    // on production server
    if (!header.access_token || process.env.NODE_ENV === 'production') {
        this.status = 403;
        this.body = { message: this.message };
    } else {
        if (!data.id) {
            // Bad request
            this.status = 400;
            this.body = { message: 'Missing parameters: id' };
        } else {
            try {
                let program = yield Program.findById(data.id);

                // Need to set saved before delete
                program.setSaved();
                yield program.delete();

                this.status = 204;
                this.body = {
                    message: this.message,
                    id: data.id
                };
            } catch (error) {
                console.error(error);
                this.status = 500;
                this.body = { message: this.message };
            }
        }
    }
};
