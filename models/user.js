'use strict';

let _       = require('lodash');
let bcrypt  = require('bluebird').promisifyAll(require('bcrypt'));
let config  = require(basedir + 'config');
let schemas = require('./utils/schemas');
let thinky  = require('./utils/thinky')();

let r = thinky.r;

const TABLE = 'user';
const FULLNAME_INDEX = 'fullname';
const SCHEMA = schemas[TABLE];

let User = thinky.createModel(TABLE, SCHEMA, {
    // No extra fields allowed
    enforce_extra: 'strict'
});

// Create indices if not existed
User.ensureIndex(FULLNAME_INDEX, function (doc) {
    return doc('name')('first')
            .add(doc('name')('middle'))
            .add(doc('name')('last'));
});

/**
 * Queries the database for matching ID. This will alleviate
 * the impact of exception thrown by Thinky by returning null
 * on not found; if you would like to handle exception, use
 * Program.get(id).
 *
 * @param   id  The id to search for
 * @return  Returns a new user object that is populated
 *          of the data found; otherwise, null is returned
 */
User.defineStatic('findById', function *(id) {
    let result = null;

    try {
        result = yield User
                .get(id);
    } catch (error) {
        console.log(error);
    }

    return result;
});

/**
 * Returns all the users
 *
 * @return  An array of all users
 */
User.defineStatic('getAllUsers', function *() {
    let result = [];

    try {
        result = yield User
                .orderBy({ index: FULLNAME_INDEX })
                .run();
    } catch (error) {
        console.log(error);
    }

    return result;
});

/**
 * Mega query composer for complex data filtering. Supports pagination.
 *
 * @param   query   The query boject
 * @return  An object of result and indicator:
 *      {
 *          results: array of found matching data in
 *                  standard object, NOT user model object
 *          hasMore: true if there are more data; false otherwise
 *      }
 */
User.defineStatic('query', function *(query) {
    let q = r.table(TABLE);
    let pagination = query.pagination;
    let tempQuery = _.pick(query, _.keys(SCHEMA));

    // Determine the desired sorting index
    let queryChained = false, useIndex;
    switch (pagination.sort) {
        default:
            useIndex = (pagination.order === 'desc') ?
                    r.desc(FULLNAME_INDEX) : FULLNAME_INDEX;

            if (tempQuery.name && tempQuery.campus) {
                q = q.getAll(
                    [tempQuery.name.first, tempQuery.name.middle, tempQuery.name.last],
                    { index: useIndex }
                );

                queryChained = true;
                tempQuery = _.omit(tempQuery, ['name']);
            }
    }

    // If getAll has been chained, don't use orderBy
    if (!queryChained) {
        q = q.orderBy({ index: useIndex });
    }

    // Filter using the information we have
    if (tempQuery.length !== 0) {
        q = q.filter(tempQuery);
    }

    // Paginate; request for one more entry to see if there are more data
    q = q.slice(pagination.start, pagination.start + pagination.limit + 1);

    if (query.fields) {
        // Remove unwanted fields
        q = q.pluck(_.intersection(query.fields, _.keys(SCHEMA)));
    }

    // Actually execute query
    let result = [];
    try {
        result = yield q.run();
        let retData = {
            results: result.slice(0, pagination.limit),
            hasMore: result.length > pagination.limit
        };

        result = retData;
    } catch (error) {
        console.error(error);
    }

    return result;
});

/**
 * Returns the full name of this user
 *
 * @return  Returns the full name of the user (first + middle + last)
 */
User.define('getFullname', function () {
    return this.name.first + ' '
            + ((this.name.middle) ? this.name.middle + ' ' : '')
            + this.name.last;
});

/**
 * Returns the preferred name of this user
 *
 * @return  Returns the preferred name (first name if not set)
 */
User.define('getPreferredName', function () {
    return (this.name.preferred && this.name.preferred !== '') ?
            this.name.preferred : this.name.first;
});

/**
 * Update the entire object to match the properties.
 * The properties configuration will be validated, and
 * unwanted properties will be discarded.
 *
 * This function does not persist the data to database yet;
 * you need to call 'save()'.
 *
 * @param   properties  The new property to assign to this object
 */
User.define('update', function (properties) {
    // TODO: Add validation

    // Check for new password
    let newPassword = properties.newPassword;
    // Make sure we only retrieve what we want
    let data = _.pick(properties, _.keys(SCHEMA));

    // Filter internal date information
    data = _.omit(data, ['created', 'verified', 'accessRights', 'password']);
    data.modified = r.now();

    // Filter names
    if (_.has(data, 'name')) {
        let newName = _.pick(data.name, _.keys(SCHEMA.name));
        _.assign(this.name, newName);
        data = _.omit(data, 'name');
    }

    // Filter contacts and address
    if (_.has(data, 'contact')) {
        let newContact = _.pick(data.contact, _.keys(SCHEMA.contact));
        if (_.has(newContact, 'address')) {
            let newAddress = _.pick(
                    newContact.address,
                    _.keys(SCHEMA.contact.address)
            );

            _.assign(this.contact.address, newAddress);
            newContact = _.omit(newContact, 'address');
        }

        _.assign(this.contact, newContact);
        data = _.omit(data, 'contact');
    }

    // If new password is set, generate a new hash
    if (newPassword) {
        if (!data.password.salt || data.pasword.salt === '') {
            data.password.salt = bcrypt.genSaltSync(config.security.hashRounds);
        }

        data.password.hash = bcrypt.hashSync(newPassword, data.password.salt);
    }

    _.assign(this, data);
});

/**
 * Pre-save hook. Sets default values if not already existed.
 *
 * @param   next    The function to be invoked after the hook.
 */
User.pre('save', function (next) {
    this.created = this.created || r.now();
    this.accessRights = this.accessRights || 'user';
    next();
});

module.exports = User;
