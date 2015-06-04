'use strict';

let _            = require('lodash');
let AreaCategory = require(basedir + 'models/area-category');

/**
 * Lists all the programs we have
 *
 * Method: GET
 * Base URL: /api/area-category/list/...
 *
 * Supports pagination. The url should be:
 *      [host]/api/area-category/list/
 *      [host]/api/area-category/list/[start]/[length]
 *      [host]/api/area-category/list/[start]/[length]/[desc]
 *
 * where [start] is the starting index (starting from 1) of the area category,
 *       [length] is the number of area category to fetch,
 *       [desc] is the order to sort (by name)
 *              It is either "desc" for sorting descendingly or nothing.
 *              If nothing, default to sorting ascendingly.
 *
 * @return  200: sets the response object to JSON representation of found
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
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
 * Gets the area category by ID
 *
 * Method: GET
 * Base URL: /api/area-category/id/[id]
 *
 * @return  200: sets the response object to JSON representation of found
 *               Single object
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
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
            let category = yield AreaCategory.get(data.id);
            this.status = 200;
            this.body = category;
        } catch (error) {
            console.error(error);
            this.status = 500;
        }
    }
};

/**
 * Gets the area category by name
 *
 * Method: GET
 * Base URL: /api/area-category/name/[name]
 *
 * @return  200: sets the response object to JSON representation of found
 *               Array of object(s)
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
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
 * Creates a new area category and returns a new ID for it
 *
 * Method: POST
 * Base URL: /api/area-category/create
 *
 * Accepts JSON object that complies with AreaCategory schema.
 *
 * @return  201: Successfully created
 *               An object with one property named "id"
 *          400: sets the resposne object to error text (displaying error)
 *          500: sets the response object to error text (hiding error)
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
 * Updates the area category specified with id
 *
 * Method: PUT
 * Base URL: /api/area-category/update
 *
 * Accepts JSON object that complies with AreaCategory schema
 *
 * @return  200: Successfully updated, and a changelog in the format of
                    {
                        id: area_category_id,
                        new: { new values },
                        old: { old values }
                    }
 *          400: Bad request, e.g. no ID specified
 *          500: Either update error or specified ID not existed
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
 * Deletes a area category given the ID
 *
 * Method: DELETE
 * Base URL: /api/area-category/delete
 *
 * Accepts JSON object is of the following format:
 *      {
 *          apiKey: key_string
 *          id: area_category_id
 *      }
 * (specification subject to changes)
 *
 * @return  204: Successfully deleted
 *          400: sets the resposne object to error text (displaying error)
 *          403: sets the response object to "Forbidden"
 *          500: sets the response object to error text (hiding error)
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
