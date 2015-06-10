'use strict';

let _       = require('lodash');
let Program = require(basedir + 'models/program');
let School  = require(basedir + 'models/school');

/**
 * @api {get}   /api/school/list    List all schools
 * @apiName     getAllSchools
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiUse  successSchoolArray
 * @apiUse  errors
 */

/**
 * @api {get}   /api/school/list/:start/:length     List all schools (paginated)
 * @apiName     getSchoolByRange
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiParam    {Number}        start       The index fo the school to begin listing from
 * @apiParam    {Number}        length      The number of schools to fetch from <code>start</code>
 * @apiParam    {String="desc"} [order]     Whether to fetch in descending order
 *
 * @apiUse  successSchoolArray
 * @apiUse  errors
 */
module.exports.listSchools = function *() {
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
                let result = yield School.getSchoolsRange(start, length, order);

                this.status = 200;
                this.body = result;
            }
        } else {
            let result = yield School.getAllSchools();
            this.status = 200;
            this.body = result;
        }
    } catch (error) {
        console.error(error);
        this.status = 500;
    }
};

/**
 * @api {get}   /api/school/id/:id  Get school by ID
 * @apiName     getSchoolById
 * @apiGroup    School
 * @apiVersion  0.0.1
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
        this.body = {
            error: 'No ID to search for',
            reqParams: this.params
        };
    } else {
        try {
            let school = yield School.findById(data.id);
            if (school) {
                this.status = 200;
                this.body = school;
            } else {
                this.status = 404;
                this.body = {
                    error: 'Object not found',
                    reqParams: this.params
                };
            }
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * @api {get}   /api/school/name/:name  Get school by name
 * @apiName     getSchoolsByName
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    name    The name to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI</code>.
 *
 * @apiUse      successSchoolArray
 * @apiUse      errors
 */
module.exports.getSchoolsByName = function *() {
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
 * @api {get}   /api/school/name/:name/:campus  Get school by name and campus
 * @apiName     getSchoolByNameCampus
 * @apiGroup    School
 * @apiVersion  0.0.1
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
        this.body = {
            error: 'No name or campus to search for',
            reqParams: this.params
        };
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
                this.body = {
                    error: 'Object not found',
                    reqParams: this.params
                };
            }
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * @api {get}   /api/school/location/:country/:state/:city  Get schools by location
 * @apiName     getSchoolsByLocation
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiDescription  Find schools by specified country, state, or city. Any subset
 *                  of preceding elements are permetted (e.g. <code>[country, state]
 *                  </code> is permitted but not <code>[state, city]</code>).
 *                  Location must be specified in that order.
 *
 * @apiParam    {String}    [country]   The country to search with.
 *                                      This parameter must be encoded
 *                                      with <code>encodeURI</code>.
 * @apiParam    {String}    [state]     The state to search with.
 *                                      This parameter must be encoded
 *                                      with <code>encodeURI</code>.
 * @apiParam    {String}    [city]      The city to search with.
 *                                      This parameter must be encoded
 *                                      with <code>encodeURI</code>.
 *
 * @apiUse      successSchoolArray
 * @apiUse      errors
 *
 * @apiParamExample {URL}   Request Example:
 *      https://applyte.io/api/school/location/Canada
 *      https://applyte.io/api/school/location/Canada/Ontario
 *      https://applyte.io/api/school/location/Canada/Ontario/University%20of%20Waterloo
 */
module.exports.getSchoolsByLocation = function *() {
    let data = _.omit(
        _.pick(this.params, ['city', 'state', 'country']),
        function (data) {
            return (!data || data === 'null');
        }
    );

    if (!data || _.isEmpty(data)) {
        this.status = 400;
        this.body = {
            error: 'Invalid location request',
            reqParams: this.params
        };
    } else {
        try {
            let schools = yield School.findByLocation(data);
            this.status = 200;
            this.body = schools;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * @api {get}   /api/school/:id/programs    Get all the program the school has
 * @apiName     getProgramsBySchoolId
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    id  The ID of the school to get all its programs
 *
 * @apiUse      successProgramArray
 * @apiUse      errors
 */
module.exports.getSchoolPrograms = function *() {
    let data = this.params;
    if (!data.id && (!data.name || !data.campus)) {
        this.status = 400;
        this.body = {
            error: 'No id or name to search for',
            reqParams: this.params
        };
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
        }
    }
};

/**
 * @api {post}  /api/school/create  Create a new school
 * @apiName     createSchool
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiDescription  Creates a new school and returns the ID of the
 *                  newly created object. The optional parameters may be
 *                  tightened in the future release.
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
        this.body = {
            error: 'ID specified',
            reqParams: this.request.body
        };
    } else {
        // Create a new school and try to save it
        let school = new School(this.request.body);

        try {
            yield school.save();
            this.status = 201;
            this.body = {
                success: 'created',
                id: school.id
            };
        } catch (error) {
            // If save failed, return server error
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * @api {put} /api/school/update     Updates an existing school
 * @apiName     updateSchool
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiDescription  Updates the School object in the database with
 *                  the specified change. Invalid keys will be ignored and
 *                  objects will be replaced as is. On success, the ID of the
 *                  updated object and the changes (new value and old value)
 *                  will be returned.
 *
 * @apiParam    {String}    id  The ID of the school to update
 * @apiUse      paramSchool
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
        this.body = {
            error: 'Cannot update without id',
            reqParams: this.request.body
        };
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
 * @api {delete} /api/school/delete    Delete an existing school
 * @apiName     deleteSchool
 * @apiGroup    School
 * @apiVersion  0.0.1
 *
 * @apiDescription  Deletes an School with specified ID. During testing,
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
module.exports.deleteSchool = function *() {
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
                let school = yield School.findById(data.id);

                // Need to set saved before delete
                school.setSaved();
                yield school.delete();

                this.status = 204;
                this.body = {
                    success: 'deleted',
                    id: data.id
                };
            } catch (error) {
                console.error(error);
                this.status = 500;
            }
        }
    }
};
