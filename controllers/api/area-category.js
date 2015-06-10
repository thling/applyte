'use strict';

let _            = require('lodash');
let AreaCategory = require(basedir + 'models/area-category');

/**
 * @api {get} /api/area-category/list   Lists all area categories
 * @apiName     getAllAreaCategories
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1

 * @apiUse  successAreaCategoryArray
 * @apiUse  errors
 */

/**
 * @api {get}   /api/area-category/list/:start/:length  List all area categories (paginated)
 * @apiName     getAreaCategoriesByRange
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1
 *
 * @apiParam    {Number}        start       Index to start listing from.
 * @apiParam    {Number}        length      Number of item to list from <code>start</code>
 * @apiParam    {String="desc"} [order]     Whether to order descendingly
 *
 * @apiUse  successAreaCategoryArray
 * @apiUse  errors
 */
module.exports.listAreaCategories = function *() {
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
                let result = yield AreaCategory
                        .getAreaCategoriesRange(start, length, order);

                this.status = 200;
                this.body = result;
            }
        } else {
            let result = yield AreaCategory.getAllAreaCategories();
            this.body = result;
            this.status = 200;
        }
    } catch (error) {
        console.error(error);
        this.status = 500;
    }
};

/**
 * @api {get} /api/area-category/id/:id     Get area category by ID
 * @apiName     getAreaCategoryById
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1
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
        this.body = {
            error: 'No ID to search for',
            reqParams: this.params
        };
    } else {
        try {
            let category = yield AreaCategory.findById(data.id);
            if (category) {
                this.status = 200;
                this.body = category;
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
 * @api {get} /api/area-category/name/:name     Find area categories by name
 * @apiName     getAreaCategoryByName
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1
 *
 * @apiParam    {String}    name    The name to search with.
 *                                  This parameter must be encoded
 *                                  with <code>encodeURI()</code>.
 *
 * @apiUse  successAreaCategoryArray
 * @apiUse  errors
 */
module.exports.getAreaCategoryByName = function *() {
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
            let category = yield AreaCategory.findByName(name);
            this.status = 200;
            this.body = category;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * @api {post}  /api/area-category/create   Create a new area category
 * @apiName     createAreaCategory
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1
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
        this.body = 'Cannot create if ID is know or existed';
    } else {
        // Create a new program and try to save it
        let category = new AreaCategory(this.request.body);

        try {
            yield category.save();
            this.status = 201;
            this.body = {
                success: 'created',
                id: category.id
            };
        } catch (error) {
            // If save failed, return server error
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * @api {put}   /api/area-category/update   Updates an existing area category
 * @apiName     updateAreaCategory
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1
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
        this.body = {
            error: 'Cannot update without id',
            reqParams: this.request.body
        };
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
        }
    }
};

/**
 * @api {delete}    /api/area-category/delete   Deletes an existing area category
 * @apiName     deleteAreaCategory
 * @apiGroup    AreaCategory
 * @apiVersion  0.0.1
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
                let category = yield AreaCategory.findById(data.id);

                // Need to set saved before delete
                category.setSaved();
                yield category.delete();

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
