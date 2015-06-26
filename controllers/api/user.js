'use strict';

let _      = require('lodash');
let errors = require(basedir + 'lib/errors');
let User   = require(basedir + 'models/user');
let utils  = require(basedir + 'lib/utils');

let BadRequestError = errors.BadRequestError;

/**
 * Parses the name supplied into a name object
 *
 * @param   query   The object that has the name fields
 */
let parseNames = function (query) {
    let name = {};

    if (query.firstname) {
        name.first = query.firstname;
    }

    if (query.middlename) {
        name.middle = query.middlename;
    }

    if (query.lastname) {
        name.last = query.lastname;
    }

    if (query.preferred) {
        name.preferred = query.preferred;
    }

    if (!_.empty(name)) {
        query.name = name;
    }
};

/**
 * Flattens the name object within a query, if existed
 *
 * @param   query   The query to flatten its object of
 * @return  A new query object with all its name subfields
 *          pulled out of the name object, e.g.
 *          {
 *              name: {
 *                  first: 'Purdue',
 *                  last: 'Pete'
 *              },
 *              ...
 *          }
 *
 *          // will become:
 *
 *          {
 *              firstname: 'Purdue',
 *              lastname: 'Pete',
 *              ...
 *          }
 */
let flattenName = function (query) {
    if (query.name) {
        if (query.name.first) {
            query.firstname = query.name.first;
        }

        if (query.name.middle) {
            query.middlename = query.name.middle;
        }

        if (query.name.last) {
            query.lastname = query.name.last;
        }

        if (query.name.preferred) {
            query.preferred = query.name.preferred;
        }
    }

    return _.omit(query, 'name');
};

/**
 * @api {get}   /api/users    Query with complex conditions
 * @apiName     query
 * @apiGroup    Users
 * @apiVersion  0.2.0
 *
 * @apiDescription  The mega query function that allows query strings,
 *                  filtering, sorting by field, sorting order, fields
 *                  selections, and possibly more in the future.
 *
 * @apiParam    {String}    [firstname]     The firsname to search for. Must be encoded
 *                                          with <code>encodeURI</code>
 * @apiParam    {String}    [middlename]    The middlename to search for. Must be encoded
 *                                          with <code>encodeURI</code>
 * @apiParam    {String}    [lastname]      The lastname to search for. Must be encoded
 *                                          with <code>encodeURI</code>
 * @apiParam    {String}    [preferred]     The preferred name to search for. Must be encoded
 *                                          with <code>encodeURI</code>
 * @apiParam    {String}    [username]      The username to search for. Must be encoded
 *                                          with <code>encodeURI</code>
 * @apiParam    {String=user,admin} [assessRights=user]
 *                                          The access rights to filter.
 * @apiParam    {String}    [fields]    The fields to select from. Fields must
 *                                      be one of the fields of the school schema,
 *                                      separated by <code>||</code> and then
 *                                      encoded with <code>encodeURI</code> entirely
 *
 * @apiParam    {Number}        [start=1]   The starting index
 * @apiParam    {Number{1-100}} [limit=10]  Number of items per page
 * @apiParam    {String=firstname,lastname} [sort=lastname] The sorting attribute
 * @apiParam    {String=asc,desc}   [order=asc] The order to sort
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get 1st to 10th users -->
 *      https://applyte.io/api/users
 *
 *      <!-- Get 33rd to 35th users -->
 *      https://applyte.io/api/users?start=33&length=3
 *
 *      <!-- Get 2nd to 8th users, sorting descendingly by firstname -->
 *      https://applyte.io/api/users?start=2&length=7&sort=firstname&order=desc
 *
 *      <!-- Get fields [id, firstname, birthday] of the users whose firstname is Sam
 *              and have access rights 'user' limit 1, start at 2, and sorted descendingly
 *              by firstname -->
 *      https://applyte.io/api/schools?fields=id||firstname||birthday
 *              &firstname=Sam&accessRights=user
 *              &limit=1&start=2&sort=firstname&order=desc
 *
 * @apiUse  successPaginationHeader
 * @apiUse  successUserArray
 * @apiUse  successUserExampleHeaders
 * @apiUse  errors
 */
module.exports.query = function *() {
    try {
        let query = this.query;
        utils.formatQueryPagination(query);
        utils.formatQueryLists(query, 'fields');

        // Check and format the query string local to school
        parseNames(query);

        // Remove unnecessary fields
        query = _.omit(
                query,
                ['start', 'limit', 'sort', 'order', 'firstname',
                        'middlename', 'lastname', 'preferred']
        );

        let users = yield User.query(query);
        let headerLink = utils.composePaginationLinkHeader(
                flattenName(query),  // Flatten the name object
                'users',
                users.hasMore
        );

        this.status = 200;
        this.body = users.results;
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
 * @api {post}  /api/users  Create a new user
 * @apiName     createUser
 * @apiGroup    Users
 * @apiVersion  0.2.0
 *
 * @apiDescription  Creates a new user and returns the ID of the
 *                  newly created object. The optional parameters may be
 *                  tightened in the future release.
 *
 * @apiUse      paramUser
 *
 * @apiSuccess  (201) {String}  success     "created"
 * @apiSuccess  (201) {String}  id          The ID of the newly created object
 *
 * @apiUse      errors
 */
module.exports.createUser = function *() {
    let data = this.request.body;

    // Reject invalid input immediately
    let invalid = _.intersection(
            _.keys(data),
            ['id', 'created', 'modified', 'accessRights', 'verified', 'password']
    );


    // Check for missing fields
    let hasMissingFields = false;
    let requiredFields = ['username', 'name.first', 'name.last', 'contact.email'];
    for (let required of requiredFields) {
        if (!_.has(data, required)) {
            hasMissingFields = true;
            break;
        }
    }

    // Reject immediately for invalid requests
    if (!_.isEmpty(invalid) || hasMissingFields) {
        this.status = 400;
        this.body = { message: 'Invalid request parameters' };
    } else if (!data.newPassword) {
        this.status = 400;
        this.body = { message: 'Password not supplied' };
    } else {
        let userdata = _.omit(data, 'newPassword');

        // Create a new school and try to save it
        let user = new User(userdata);
        user.setPassword(data.newPassword);

        try {
            yield user.save();
            this.status = 201;
            this.body = {
                message: this.message,
                id: user.id
            };
        } catch (error) {
            // If save failed, return server error
            console.error(error);
            this.status = 500;
            this.body = { message: this.message };
        }
    }
};
