'use strict';

let _       = require('lodash');
let Promise = require('bluebird');
let bcrypt  = Promise.promisifyAll(require('bcrypt'));
let config  = require(basedir + 'config');
let errors  = require(basedir + 'lib/errors');
let schemas = require('./utils/schemas');
let thinky  = require('./utils/thinky')();
let utils   = require(basedir + 'lib/utils');

let r = thinky.r;
let UserExistedError = errors.UserExistedError;
let MissingPropertyError = errors.MissingPropertyError;
let UserNotFoundError = errors.UserNotFoundError;

const TABLE = 'user';
const FULLNAME_INDEX = 'fullname';
const EMAIL_INDEX = 'email';
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

User.ensureIndex(EMAIL_INDEX, function (doc) {
    return doc('contact')('email');
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

User.defineStatic('findByUsername', function *(username) {
    let result = null;
    try {
        result = yield User
                .getAll(username, { index: EMAIL_INDEX })
                .run();

        if (result.length > 1) {
            console.error('More than one matching emails');
        }
    } catch(error) {
        console.error(error.message);
    }

    return result[0];
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
 * Validates the parameter against the schema of this model
 *
 * @param   properties  The properties to validate
 */
User.defineStatic('validate', function (properties) {
    utils.assertObjectSchema(
            properties,
            SCHEMA,
            { noMissing: false }
    );
});

/**
 * Matches the database with username, then see if the password
 * hash matches.
 *
 * @param   username    The username (email in our case) to search for
 * @param   password    The password supplied by the username
 * @return  The user object if the password matches
 * @throws  UserNotFoundError if user does not exist or passwords do not match
 */
User.defineStatic('matchUser', function *(username, password) {
    let authenticated = false, user;
    try {
        user = yield User.findByUsername(username);
        if (user) {
            // TODO: check if login count > 5
            authenticated = user.authenticate(password);
        }
    } catch (error) {
        console.error(error.message);
        if (user) {
            // TODO: Add login count
        }
    }

    if (!user || !authenticated) {
        throw new UserNotFoundError('Username ' + username + 'does not exist');
    }

    return user;
});

/**
 * Verifies whether the password matches the own password
 * @param   password    The password to verify
 * @return  True if passed and false if failed
 */
User.define('authenticate', function (password) {
    return bcrypt.compareSync(password, this.password);
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

User.define('getUsername', function () {
    return this.contact.email;
});

/**
 * Sets the password. Updates salt and store the hashed password with salt.
 *
 * @param   password    The new password to be set
 */
User.define('setPassword', function (password) {
    this.password = null;

    let salt = bcrypt.genSaltSync(config.security.hashRounds);
    this.password = bcrypt.hashSync(password, salt);
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
    // Validate the properties
    User.validate(properties);

    // Filter internal date information
    let data = _.omit(
            properties,
            ['id', 'created', 'verified', 'accessRights', 'password']
    );

    utils.assignDeep(this, data);

    // We will need to re-verify the user if the email is changed
    if (_.has(data, 'contact.email')) {
        this.verified = false;
    }
});

/**
 * Pre-save hook. Sets default values if not already existed.
 *
 * @param   next    The function to be invoked after the hook.
 */
User.pre('save', function (next) {
    let _self = this;
    let preprocess = function () {
        // If everything's all right, do preprocessing
        _self.created = _self.created || r.now();
        _self.modified = r.now();
        _self.name.preferred = _self.name.preferred || _self.name.first;
        _self.name.middle = _self.name.middle || '';
        _self.accessRights = _self.accessRights || 'user';
        _self.verified = _self.verified || false;
        next();
    };

    if (this.id && this.verified) {
        // This is an update request
        preprocess();
    } else if (!this.contact.email) {
        next(new MissingPropertyError('Email is missing from user'));
    } else {
        // Find any user with the same email address
        User.getAll(this.contact.email, { index: EMAIL_INDEX })
            .run()
            .then(function (emails) {
                if (emails.length > 1) {
                    // We have a bigger problem, set up the system
                    // to email admin!
                    console.error('BIG PROBLEM!!!');
                } else if (!_.isEmpty(emails) && emails[0].id !== _self.id) {
                    throw new UserExistedError(
                            'User with email '
                            + _self.contact.email + ' '
                            + 'already existed'
                    );
                }
            })
            .then(preprocess)
            .catch(function (err) {
                next(err);
            });
    }
});

module.exports = User;
