'use strict';

let _       = require('lodash');
let errors  = require(basedir + 'lib/errors');
let Faculty = require(basedir + 'models/faculty');
let Program = require(basedir + 'models/program');
let utils   = require(basedir + 'lib/utils');

let BadRequestError = errors.BadRequestError;

/**
 * @api {get}   /api/programs    Query with complex conditions
 * @apiName     query
 * @apiGroup    Programs
 * @apiVersion  0.2.1
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
 * @apiParam    {String=name}   [sort=name] The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th programs -->
 *      https://applyte.io/api/programs
 *
 *      <!-- Get 33rd to 35th programs -->
 *      https://applyte.io/api/programs?start=33&length=3
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
 * @apiUse  successPaginationHeader
 * @apiUse  successProgramArray
 * @apiUse  successProgramExampleHeaders
 * @apiUse  errors
 */
module.exports.query = function *() {
    try {
        let query = this.query;

        utils.formatQueryPagination(query, ['name', 'rank']);
        utils.formatQueryLists(query, ['fields', 'areas']);
        utils.formatRangeConditions(
                query,
                [{
                    name: 'tuition',
                    parser: parseFloat
                }, {
                    name: 'deadline',
                    parser: function (param) {
                        return new Date(param).toISOString();
                    }
                }]
        );

        query.school = (query.school === 'true');
        query = _.omit(query, ['start', 'limit', 'sort', 'order']);

        let programs = yield Program.query(query);
        let headerLink = utils.composePaginationLinkHeader(
                query,
                'programs',
                programs.hasMore
        );

        this.status = 200;
        this.body = programs.results;
        this.set('Link', headerLink);
    } catch (error) {
        if (error instanceof BadRequestError) {
            error.generateContext(this);
        } else {
            console.error(error);
            this.status = 500;
            this.body = { message: 'Internal error' };

        }
    }
};

/**
 * @api {get}   /api/programs/:id      Get program by ID
 * @apiName     getProgramById
 * @apiGroup    Programs
 * @apiVersion  0.2.1
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

module.exports.getProgramAreas = function *() {
    let data = this.params;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            let program = yield Program.get(data.id);
            // program.getAllAreas
        } catch (error) {
            this.status = 400;
            this.body = { message: 'Program with id ' + data.id + ' does not exist' };
        }
    }
};

/**
 * Updates or insert faculty in the newly created or updated program
 *
 * @param   program     The program that contains the faculty information
 */
let upsertFaculties = function *(program) {
    // Save faculty information for each area
    for (let area of program.areas) {
        if (area.faculties) {
            let facultyIds = null;
            for (let faculty of area.faculties) {
                if (_.isPlainObject(faculty)) {
                    let facultyToSave;
                    if (faculty.id) {
                        // If faculty ID existed, updated it
                        facultyToSave = yield Faculty.get(faculty.id);
                        facultyToSave.update(faculty);
                    } else {
                        // Otherwise, create it
                        facultyToSave = new Faculty(faculty);
                    }

                    // Save the updated or created faculty
                    yield facultyToSave.save();
                    if (facultyIds === null) {
                        facultyIds = [];
                    }

                    facultyIds.push(facultyToSave.id);
                }
            }

            // If the list was never updated, use the original
            if (facultyIds !== null) {
                area.faculties = facultyIds;
            }
        }
    }

};

/**
 * @api {post}  /api/programs     Create a new program
 * @apiName     createProgram
 * @apiGroup    Programs
 * @apiVersion  0.2.1
 * @apiPermission   Admin
 *
 * @apiHeader   {String}    Authorization   The access token received after
 *                                          logging in. The scheme is "Bearer".
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
        try {
            // Create a new program and try to save it
            let program = new Program(this.request.body);

            // Update or insert faculties
            yield upsertFaculties(program);

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
 * @apiVersion  0.2.1
 * @apiPermission   Admin
 *
 * @apiDescription  Updates the Program object in the database with
 *                  the specified change. Invalid keys will be ignored and
 *                  objects will be replaced as is. On success, the ID of the
 *                  updated object and the changes (new value and old value)
 *                  will be returned.
 *
 * @apiHeader   {String}    Authorization   The access token received after
 *                                          logging in. The scheme is "Bearer".
 *
 * @apiParam    {String}    id  The ID of the program to update
 * @apiUse      paramProgramOptional
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
 *                          desc: 'This is destributed system'
 *                      },
 *                      {
 *                          name: 'Information Security',
 *                          desc: 'This is infosec'
 *                      }
 *                  ]
 *              },
 *              old: {
 *                  name: 'Computer and Information Technology',
 *                  areas: [
 *                      {
 *                          name: 'Databases'
 *                          desc: 'This is databases'
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
            let program = yield Program.get(data.id);
            let changed = utils.diffObjects(data, program);

            program.update(data);

            // Update or insert faculties
            yield upsertFaculties(program);
            yield program.save();

            this.status = 200;
            this.body = {
                id: program.id,
                new: changed.new,
                old: changed.old
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
 * @apiVersion  0.2.1
 * @apiPermission   Admin
 *
 * @apiDescription  Deletes an Program with specified ID. During testing,
 *                  any <code>access-token</code> will work; in production,
 *                  this API will reject anything as it is still in test.
 *
 * @apiHeader   {String}    Authorization   The access token received after
 *                                          logging in. The scheme is "Bearer".
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

    if (!data.id) {
        // Bad request
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            let program = yield Program.findById(data.id);
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
};
