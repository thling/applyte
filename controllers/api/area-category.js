'use strict';

let _            = require('lodash');
let AreaCategory = require(basedir + 'models/area-category');
let errors       = require(basedir + 'lib/errors');
let utils        = require(basedir + 'lib/utils');

let BadRequestError = errors.BadRequestError;

/**
 * @api {get}   /api/area-categories    Query with complex conditions
 * @apiName     query
 * @apiGroup    AreaCategories
 * @apiVersion  0.1.0
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [name]      The name to search for. Must be encoded
 *                                      with <code>encodeURI</code>
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=name} [sort=name]   The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc]
 *                                          The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th area categories -->
 *      https://applyte.io/api/area-categories
 *
 *      <!-- Get 33rd to 35th area categories -->
 *      https://applyte.io/api/area-categories?start=33&length=3
 *
 *      <!-- Get 2nd to 8th area categories, sorting descendingly by name -->
 *      https://applyte.io/api/area-categories?start=2&length=7&sort=name&order=desc
 *
 *      <!-- Get field 'name' of area categories -->
 *      https://applyte.io/api/area-categories?fields=name
 *
 * @apiUse  successPaginationHeader
 * @apiUse  successAreaCategoryArray
 * @apiUse  successAreaCategoryExampleHeaders
 * @apiUse  errors
 */
module.exports.query = function *() {
    try {
        let query = this.query;

        utils.formatQueryPagination(query);
        utils.formatQueryLists(query, 'fields');
        query = _.omit(query, ['start', 'limit', 'sort', 'order']);

        let categories = yield AreaCategory.query(query);
        let headerLink = utils.composePaginationLinkHeader(
                query,
                'area-categories',
                categories.hasMore
        );

        this.status = 200;
        this.body = categories.results;
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
 * @api {get} /api/area-categories/:id     Get area category by ID
 * @apiName     getAreaCategoryById
 * @apiGroup    AreaCategories
 * @apiVersion  0.1.0
 *
 * @apiParam    {String} id     The ID of the area category
 *
 * @apiUse      successAreaCategory
 *
 * @apiError    (404)   {json}  NotFound    The specified ID does not exist
 * @apiUse      errors
 */
module.exports.getAreaCategoryById = function *() {
    let data = this.params;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            let category = yield AreaCategory.findById(data.id);

            if (category) {
                this.status = 200;
                this.body = category;
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
 * @api {post}  /api/area-categories   Create a new area category
 * @apiName     createAreaCategory
 * @apiGroup    AreaCategories
 * @apiVersion  0.1.0
 *
 * @apiDescription  Creates a new area category and returns the ID of the
 *                  newly created object. The optional parameters may be
 *                  tightened in the future release.
 *
 * @apiUse      paramAreaCategory
 *
 * @apiSuccess  (201)   {String}    success     "created"
 * @apiSuccess  (201)   {String}    id          The ID of the newly created object
 * @apiUse      errors
 */
module.exports.createAreaCategory = function *() {
    let data = this.request.body;
    if (data.id) {
        this.status = 400;
        this.body = { message: 'Request will not be idempotent' };
    } else {
        // Create a new program and try to save it
        let category = new AreaCategory(this.request.body);

        try {
            yield category.save();
            this.status = 201;
            this.body = {
                message: this.message,
                id: category.id
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
 * @api {put}   /api/area-categories   Updates an existing area category
 * @apiName     updateAreaCategory
 * @apiGroup    AreaCategories
 * @apiVersion  0.1.0
 *
 * @apiDescription  Updates the AreaCategory object in the database with
 *                  the specified change. Invalid keys will be ignored and
 *                  objects will be replaced as is. On success, the ID of the
 *                  updated object and the changes (new value and old value)
 *                  will be returned.
 *
 * @apiParam    {string}    id  ID of the object to be updated
 * @apiUse      paramAreaCategoryOptional
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
 *                  name: 'Cloud Computing'
 *              },
 *              old: {
 *                  name: 'Cloud Server'
 *              }
 *          }
 */
module.exports.updateAreaCategory = function *() {
    let data = this.request.body;

    if (!data.id) {
        this.status = 400;
        this.body = { message: 'Missing parameters: id' };
    } else {
        try {
            // Sanitize in case this is used as fabrication
            let newData = _.omit(data, 'id');
            let category = yield AreaCategory.get(data.id);
            let oldValue = _.pick(category, _.keys(newData));

            // Need to set as saved before updating
            category.setSaved();
            category.update(newData);
            yield category.save();

            let newValue = _.pick(category, _.keys(newData));

            this.status = 200;
            this.body = {
                id: category.id,
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
 * @api {delete}    /api/area-categories   Deletes an existing area category
 * @apiName     deleteAreaCategory
 * @apiGroup    AreaCategories
 * @apiVersion  0.1.0
 *
 * @apiDescription  Deletes an AreaCategory with specified ID. During testing,
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
module.exports.deleteAreaCategory = function *() {
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
                let category = yield AreaCategory.findById(data.id);

                // Need to set saved before delete
                category.setSaved();
                yield category.delete();

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
