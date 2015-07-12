'use strict';

let jwt      = require('koa-jwt');
let passport = require('koa-passport');
let config   = require(basedir + 'config');
let errors   = require(basedir + 'lib/errors');

let BadRequestError = errors.BadRequestError;

/**
 * @api {get}   /api/auth/login     Request login token
 * @apiName     Request login CSRF token
 * @apiGroup    Authentication
 * @apiVersion  0.2.0
 *
 * @apiDescription  This request will return a CSRF token for further login use
 *
 * @apiParamExample {URL}  Request Examples
 *      <!-- Get token -->
 *      https://applyte.io/api/auth/login
 *
 * @apiSuccess  (200) {String}  _csrf   The CSRF token to be included
 */
module.exports.requestToken = function *() {
    this.status = 200;
    this.body = {
        _csrf: this.csrf
    };
};

/**
 * @api {post}  /api/auth/login     Request to login
 * @apiName     Login user
 * @apiGroup    Authentication
 * @apiVersion  0.2.0
 *
 * @apiDescription  This API will attempt to login a user
 *
 * @apiHeader   {String}    x-csrf-token    The CSRF token by a GET request to this resource
 *
 * @apiParam    {String}    username    The username of the user (email)
 * @apiParam    {String}    password    The hashed password
 *
 * @apiParamExample {URL}  Request Examples
 *          <!-- POST to -->
 *          https://applyte.io/api/auth/login
 *
 *          <!-- Header -->
 *          Content-Type: application/json
 *          x-csrf-token: fjiowaejioajwoifejaiowefj
 *
 *          <!-- POST body -->
 *          {
 *              "username": "test@example.com"
 *              "password": "ajiowejflaawefowiejflawiejfolawiejf"
 *          }
 *
 * @apiSuccess  (201) {String}  message     The logged in message
 * @apiSuccess  (201) {String}  accessToken The access token
 *
 * @apiError    (403)   {String} message    Error message
 */
module.exports.login = function *() {
    try {
        // Check if CSRF token is valid
        this.assertCSRF();

        // Attempts to authenticate the user
        let user;
        yield passport.authenticate('local', function *(err, usr) {
            if (err) {
                throw err;
            }

            if (!usr) {
                throw new BadRequestError('Bad login', 401);
            }

            user = usr;
        });

        // Generate JWT payload
        let claim = {
            userId: user.id,
            accessRights: user.accessRights
        };

        // Sign the token
        let token = jwt.sign(claim, config.security.jwtSecret, {
            expiresInMinutes: 60 * 24 * 7
        });

        this.status = 201;
        this.body = {
            message: 'Logged in',
            accessToken: token
        };
    } catch (error) {
        if (error.type === 'BadRequestError') {
            error.generateContext(this);
        } else {
            this.status = 403;
            this.body = {
                message: error.message
            };
        }
    }
};

/**
 * @api {put}   /api/auth/refresh-token     Request to refresh token
 * @apiName     Refresh access token
 * @apiGroup    Authentication
 * @apiVersion  0.2.0
 *
 * @apiDescription  This API will extend the TTL of the token
 *
 * @apiHeader   {String}    Authorization   The token using Bearer scheme
 *
 * @apiParamExample {URL}  Request Examples
 *          <!-- PUT to -->
 *          https://applyte.io/api/auth/refresh-token
 *
 *          <!-- Header -->
 *          Authorization: Bearer ajwieofjaiweo.ajweifajwoief.awjeiofwjoiaef
 *
 * @apiSuccess  (200) {String}  message     The logged in message
 * @apiSuccess  (200) {String}  accessToken The extended access token
 *
 * @apiError    (403)   {String} message    "Unauthorized"
 */
module.exports.refreshToken = function *() {
    if (!this.state.user) {
        this.status = 403;
        this.body = {
            message: 'Unauthorized'
        };
    } else {
        let newClaim = {
            userId: this.state.user.userId,
            accessRights: this.state.user.accessRights
        };

        // Extend by 7 days from now
        let token = jwt.sign(newClaim, config.security.jwtSecret, {
            expiresInMinutes: 60 * 24 * 7
        });

        this.status = 200;
        this.body = {
            message: 'Token extended',
            accessToken: token
        };
    }
};

/**
 * @api {get}   /api/auth/test-token    Test authorization header
 * @apiName     Test Authorization Header
 * @apiGroup    Authentication
 * @apiVersion  0.2.0
 *
 * @apiDescription  For testing if your application is using the authorization header correctly.
 *
 * @apiHeader   {String}    Authorization   The token using Bearer scheme
 *
 * @apiParamExample {URL}  Request Examples
 *          <!-- GET to -->
 *          https://applyte.io/api/auth/test-token
 *
 *          <!-- Header -->
 *          Authorization: Bearer ajwieofjaiweo.ajweifajwoief.awjeiofwjoiaef
 *
 * @apiSuccess  (200) {String}  message     "The logged in message"
 * @apiSuccess  (200) {String}  user        The non-private info of the authorized user
 *
 * @apiError    (403)   {String} message    Error message
 * @apiError    (403)   {String} user       "undefined"
 */
module.exports.tokenTest = function *() {
    let message, user;

    // Check if authorization header exists
    if (this.header.authorization) {
        let parts = this.header.authorization.split(' ');
        if (parts[0] === 'Bearer') {
            try {
                user = jwt.verify(parts[1], config.security.jwtSecret);
            } catch (error) {
                this.status = 403;
                message = error.message;
            }
        } else {
            this.status = 403;
            message = 'unsupported authorization scheme';
        }
    } else {
        this.status = 403;
        message = 'no authorization header was found';
    }

    this.status = this.status || 200;
    this.body = {
        message: message || 'Authorized',
        user: user || 'undefined'
    };
};
