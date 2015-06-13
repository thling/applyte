'use strict';

let _       = require('lodash');
let Program = require(basedir + 'models/program');

/**
 * Format and check the pagination specifications in a query.
 *
 * @param   ctx     The request object
 */
let paginationCheck = function (ctx) {
    let pagination = {};

    if (ctx.query.start && ctx.query.start < 1) {
        ctx.status = 422;
        ctx.body = { message: 'Invalid start: ' + ctx.query.start };
    } else {
        pagination.start = (parseInt(ctx.query.start) || 1) - 1;
    }

    if (ctx.query.limit && (ctx.query.limit < 1 || ctx.query.limit > 100)) {
        ctx.status = 422;
        ctx.body = { message: 'Invalid limit: ' + ctx.query.limit };
    } else {
        pagination.limit = parseInt(ctx.query.limit) || 10;
    }

    if (ctx.query.sort && !(_.includes(['name'], ctx.query.sort))) {
        ctx.status = 422;
        ctx.body = { message: 'Invalid sort: ' + ctx.query.sort };
    } else {
        pagination.sort = ctx.query.order || 'name';
    }

    if (ctx.query.order && !(_.includes(['asc', 'desc'], ctx.query.order))) {
        ctx.status = 422;
        ctx.body = { message: 'Invalid order: ' + ctx.query.order };
    } else {
        pagination.order = ctx.query.order || 'asc';
    }

    ctx.query.pagination = pagination;
};

/**
 * Format and check the areas to search
 *
 * @param   ctx     The request object
 */
let areasCheck = function (ctx) {
    if (ctx.query.areas) {
        ctx.query.areas = ctx.query.areas.split('||');
    }
};

/**
 * Format and check the fields to be returned in a query.
 *
 * @param   ctx     The request object
 */
let fieldsCheck = function (ctx) {
    if (ctx.query.fields) {
        ctx.query.fields = ctx.query.fields.split('||');
    }

    ctx.query.school = (ctx.query.school && ctx.query.school === 'true');
};

/**
 * @api {get}   /api/programs    Query with complex conditions
 * @apiName     query
 * @apiGroup    Programs
 * @apiVersion  0.0.1
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [name]      The name to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [degree]    The degree to search for. Require name
 *                                      if this is specified. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [level]     The level to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [department]    The department to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [faculty]   The faculty to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [areas]     The areas to search for. Check if the program
 *                                      contains one or more of the specified areas.
 *                                      Multiple areas can be separated by <code>||</code>,
 *                                      and then encoded with <code>encodeURI</code> entirely.
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 * @apiParam    {String=true,false} [school=false]
 *                                      Include the actual School data referenced to
 *                                      by the <code>schoolId</code> field.
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=name} [sort=name]   The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th programs -->
 *      https://applyte.io/api/programs
 *
 *      <!-- Get 33rd to 35th programs -->
 *      https://applyte.io/api/programs?start=33&length=33
 *
 *      <!-- Get 2nd to 8th programs, sorting descendingly by name -->
 *      https://applyte.io/api/programs?start=2&length=7&sort=name&order=desc
 *
 *      <!-- Get the 2nd program with 'Database' area that is Undergraduate
 *              level and whose faculty is School of Engineering, sorted desc,
 *              include the data of the school this program belongs to -->
 *      https://applyte.io/api/schools?start=2&fields=name||schoolId
 *              &areas=Databases&level=Undergraduate
 *              &faculty=School%20of%20Engineering&order=desc
 *              &school=true
 *
 * @apiUse  successProgramArray
 * @apiUse  errors
 */
module.exports.getPrograms = function *() {
    // Parse pagination parameters
    paginationCheck(this);
    areasCheck(this);
    fieldsCheck(this);

    if (!this.body) {
        try {
            let programs = yield Program.query(this.query);

            this.status = 200;
            this.body = programs;
            this.set({
                // TODO: Implement header navigation
                'link': ''
            });
        } catch (error) {
            console.log(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {get}   /api/programs/:id      Get program by ID
 * @apiName     getProgramById
 * @apiGroup    Programs
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
 * @api {get}   /api/programs/level/:level   Get programs by level
 * @apiName     getProgramsByLevel
 * @apiGroup    Programs
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
 * @api {get}   /api/programs/area/:areaName     Get programs by area name
 * @apiName     getProgramsByAreaName
 * @apiGroup    Programs
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
 * @api {get}   /api/programs/categories/:categories     Get programs by categories
 * @apiName     getProgramsByCategories
 * @apiGroup    Programs
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
 *      https://applyte.io/api/programs/categories/Database%7C%7CSecurity
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
 * @api {post}  /api/programs     Create a new program
 * @apiName     createProgram
 * @apiGroup    Programs
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
 * @api {put}   /api/programs     Updates an existing program
 * @apiName     updateProgram
 * @apiGroup    Programs
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
 * @api {delete}    /api/programs     Deletes an existing program
 * @apiName     deleteProgram
 * @apiGroup    Programs
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
