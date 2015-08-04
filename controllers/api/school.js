'use strict';

let _       = require('lodash');
let errors  = require(basedir + 'lib/errors');
let Program = require(basedir + 'models/program');
let School  = require(basedir + 'models/school');
let utils   = require(basedir + 'lib/utils');

let BadRequestError = errors.BadRequestError;

/**
 * Format and check the name and campus filters in a query.
 *
 * @param   query   The query object
 */
let assertNameCampus = function (query) {
    if (query.campus && !query.name) {
        throw new BadRequestError('\'name\' is required when specifying campus', 422);
    }
};

/**
 * Format and check the location filters in a query.
 *
 * @param   query   The query object
 */
let assertLocation = function (query) {
    let address = {};

    if (query.city) {
        address.city = query.city;
    }

    if (query.state) {
        address.state = query.state;
    }

    if (query.country) {
        address.country = query.country;
    }

    if (!_.isEmpty(address)) {
        query.address = address;
    }
};

/**
 * Flattens the address object within a query, if existed
 *
 * @param   query   The query to flatten its object of
 * @return  A new query object with all its address subfields
 *          pulled out of the address object, e.g.
 *          {
 *              address: {
 *                  city: 'West Lafayette'
 *              },
 *              ...
 *          }
 *
 *          // will become:
 *
 *          {
 *              city: 'West Lafayette',
 *              ...
 *          }
 */
let flattenAddress = function (query) {
    if (query.address) {
        if (query.address.city) {
            query.city = query.address.city;
        }

        if (query.address.state) {
            query.state = query.address.state;
        }

        if (query.address.country) {
            query.country = query.address.country;
        }
    }

    return _.omit(query, 'address');
};

/**
 * @api {get}   /api/schools    Query with complex conditions
 * @apiName     query
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [name]      The name to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [campus]    The campus to search for. Require name
 *                                      if this is specified. Must be encoded
 *                                      with <code>encodeURI</code>
 *
 * @apiParam    {String}    [country]   The country to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [state]     The state/province to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [city]      The city to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 *
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=name}   [sort=name] The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th schools -->
 *      https://applyte.io/api/schools
 *
 *      <!-- Get 33rd to 35th schools -->
 *      https://applyte.io/api/schools?start=33&length=3
 *
 *      <!-- Get 2nd to 8th schools, sorting descendingly by name -->
 *      https://applyte.io/api/schools?start=2&length=7&sort=name&order=desc
 *
 *      <!-- Get fields [id, name, campus] of the schools that are located in Boston, MA, US,
 *              limit 1, start at 2, and sorted descendingly -->
 *      https://applyte.io/api/schools?fields=id||name||campus
 *              &country=United%20States%20of%20America&state=Massachusetts&city=Boston
 *              &limit=1&start=2&order=desc
 *
 * @apiUse  successPaginationHeader
 * @apiUse  successSchoolArray
 * @apiUse  successSchoolExampleHeaders
 * @apiUse  errors
 */
module.exports.query = function *() {
    try {
        let query = this.query;
        utils.formatQueryPagination(query);
        utils.formatQueryLists(query, 'fields');

        // Check and format the query string local to school
        assertNameCampus(query);
        assertLocation(query);

        // Remove unnecessary fields
        query = _.omit(
                query,
                ['start', 'limit', 'sort', 'order', 'city', 'state', 'country']
        );

        let schools = yield School.query(query);
        let headerLink = utils.composePaginationLinkHeader(
                flattenAddress(query),  // Flatten the address object
                'schools',
                schools.hasMore
        );

        this.status = 200;
        this.body = schools.results;
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
 * @api {get}   /api/schools/:id  Get school by ID
 * @apiName     getSchoolById
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 *
 * @apiParam    {String}    id  The ID of the school to retrieve
 *
 * @apiUse      successSchool
 *
 * @apiError    (404)   {json}  NotFound    The specified ID does not exist
 * @apiUse      errors
 */
module.exports.getSchoolById = function *() {
    let data = this.params;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            let school = yield School.findById(data.id);
            if (school) {
                this.status = 200;
                this.body = school;
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
 * @api {get}   /api/schools/:name/:campus  Get school by name and campus
 * @apiName     getSchoolByNameCampus
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 *
 * @apiDescription  This API will return single object as <code>name</code>
 *                  and <code>campus</code> can uniquely identify a school.
 *
 * @apiParam    {String}    name    The name to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI</code>.
 * @apiParam    {String}    campus  The campus to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI</code>.
 *
 * @apiUse      successSchool
 *
 * @apiError    (404)   {json}  NotFound    The specified name and campus do not exist
 * @apiUse      errors
 */
module.exports.getSchoolByNameCampus = function *() {
    let data = this.params;
    if (!data.name || !data.campus) {
        this.status = 400;
        this.body = { message: 'Missing parameters: name or campus' };
    } else {
        let name = decodeURI(data.name);
        let campus = decodeURI(data.campus);

        try {
            let school = yield School.findByNameCampus(name, campus);

            if (school) {
                this.status = 200;
                this.body = school;
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
 * @api {get}   /api/schools/:id/programs    Get all the program the school has
 * @apiName     getProgramsBySchoolId
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 *
 * @apiParam    {String}    id  The ID of the school to get all its programs
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 */

/**
 * @api {get}   /api/school/:name/:campus/programs    Get all the program the school has
 * @apiName     getProgramsBySchooNameCampus
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 *
 * @apiParam    {String}    name    The name of the school to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI</code>.
 * @apiParam    {String}    campus  The campus of the school to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI</code>.
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 */
module.exports.getSchoolPrograms = function *() {
    let data = this.params;
    if (!data.id && (!data.name || !data.campus)) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id or (name and campus)' };
    } else {
        try {
            let school;

            if (data.id) {
                school = yield School.get(data.id);
            } else {
                school = yield School.findByNameCampus(
                    decodeURI(data.name),
                    decodeURI(data.campus)
                );
            }

            let programs = yield Program.getProgramsBySchoolId(school.id);

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
 * @api {post}  /api/schools  Create a new school
 * @apiName     createSchool
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 * @apiPermission   Admin
 *
 * @apiDescription  Creates a new school and returns the ID of the
 *                  newly created object. The optional parameters may be
 *                  tightened in the future release.
 *
 * @apiHeader   {String}    Authorization   The access token received after
 *                                          logging in. The scheme is "Bearer".
 *
 * @apiUse      paramSchool
 *
 * @apiSuccess  (201) {String}  success     "created"
 * @apiSuccess  (201) {String}  id          The ID of the newly created object
 *
 * @apiUse      errors
 */
module.exports.createSchool = function *() {
    let data = this.request.body;
    if (data.id) {
        this.status = 400;
        this.body = { message: 'Request will not be idempotent' };
    } else {
        // Create a new school and try to save it
        let school = new School(this.request.body);

        try {
            yield school.save();
            this.status = 201;
            this.body = {
                message: this.message,
                id: school.id
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
 * @api {put} /api/schools     Updates an existing school
 * @apiName     updateSchool
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 * @apiPermission   Admin
 *
 * @apiDescription  Updates the School object in the database with
 *                  the specified change. Invalid keys will be ignored and
 *                  objects will be replaced as is. On success, the ID of the
 *                  updated object and the changes (new value and old value)
 *                  will be returned.
 *
 * @apiHeader   {String}    Authorization   The access token received after
 *                                          logging in. The scheme is "Bearer".
 *
 * @apiParam    {String}    id  The ID of the school to update
 * @apiUse      paramSchoolOptional
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
 * @apiSuccessExample   {json}  Response Example (Success)
 *          HTTP/1.1 200 OK
 *          {
 *              id: '103fa394-caca-4c1d-9374-f64d41dd52f6'
 *              new: {
 *                  name: 'Purdue University',
 *                  campus: 'West Lafayette',
 *                  address: {
 *                      address1: 'Just want to update this only'
 *                  }
 *              },
 *              old: {
 *                  name: 'Purdue Universities',
 *                  campus: 'Calumet',
 *                  address: {
 *                      address1: '610 Purdue Mall',
 *                      city: 'West Lafayette',
 *                      state: 'Indiana',
 *                      postalCode: '47907',
 *                      country: 'United States of America'
 *                  }
 *              }
 *          }
 */
module.exports.updateSchool = function *() {
    let data = this.request.body;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            // Sanitize in case this is used as fabrication
            let school = yield School.get(data.id);
            let changed = utils.diffObjects(data, school);

            // Need to set as saved before updating
            school.update(data);
            yield school.save();

            this.status = 200;
            this.body = {
                id: school.id,
                old: changed.old,
                new: changed.new
            };
        } catch (error) {
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};

/**
 * @api {delete} /api/schools    Delete an existing school
 * @apiName     deleteSchool
 * @apiGroup    Schools
 * @apiVersion  0.2.1
 * @apiPermission   Admin
 *
 * @apiDescription  Deletes an School with specified ID. During testing,
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
module.exports.deleteSchool = function *() {
    let data = this.request.body;

    if (!data.id) {
        // Bad request
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            let school = yield School.findById(data.id);

            // Need to set saved before delete
            yield school.delete();

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
