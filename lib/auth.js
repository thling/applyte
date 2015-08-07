'use strict';

let co      = require('co');
let config  = require(basedir + 'config');
let errors  = require(basedir + 'lib/errors');
let request = require('koa-request');
let User    = require(basedir + 'models/user');

let UserNotAuthorizedError = errors.UserNotAuthorizedError;
let BadRequestError = errors.BadRequestError;

/**
 * Authenticator module that acts as middle ware in router
 * Use these to authenticate users
 *
 * Example: router.post('/api/example', authenticator.admin, example.create);
 *      This route will only allow POST request to be passed to
 *      example.create function iff user is an admin
 */
module.exports.authenticator = {

    /**
     * Any verified user
     */
    verified: function *(next) {
        let user = this.state.user;
        if (user && user.verified) {
            yield next;
        } else {
            throw new UserNotAuthorizedError();
        }
    },

    /**
     * Any user, including admin and developer
     */
    user: function *(next) {
        let user = this.state.user;
        if (user && user.verified
                && (user.accessRights === 'user'
                        || user.accessRights === 'admin')) {
            yield next;
        } else {
            throw new UserNotAuthorizedError();
        }
    },

    /**
     * Developers, including admin
     */
    developer: function *(next) {
        let user = this.state.user;
        if (user && user.verified && user.accessRights === 'developer') {
            yield next;
        } else {
            throw new UserNotAuthorizedError();
        }
    },

    /**
     * Administrators only
     */
    admin: function *(next) {
        let user = this.state.user;
        if (user && user.verified && user.accessRights === 'admin') {
            yield next;
        } else {
            throw new UserNotAuthorizedError();
        }
    }
};

/**
 * Verifiers are for verifying action tokens. This includes
 * csrf token, recaptcha status, etc. Same usage as authenticator
 */
module.exports.verifier = {

    /**
     * Verify that the CSRF token exists and is valid
     *
     * Skipped if client-token for mobile apps is provided.
     */
    csrf: function *(next) {
        let apiKey = this.request.body.apiKey;

        // Skip for non production
        if (config.mode !== 'production'
                || apiKey === config.security.apiKey) {
            // TODO: move to a better API key management scheme
            yield next;
            return;
        }

        try {
            this.assertCSRF();
            yield next;
        } catch (error) {
            throw new BadRequestError(error.message, 403);
        }
    },

    /**
     * Verifies that the user doing this action is a human.
     *
     * Skipped if client-token for mobile apps is provided.
     */
    recaptcha: function *(next) {
        let apiKey = this.request.body.apiKey;

        // Skip for non production
        if (config.mode !== 'production'
                || apiKey === config.security.apiKey) {
            // TODO: move to a better API key management scheme
            yield next;
            return;
        }

        // Obtain the recaptcha response key
        let recaptcha = this.request.body.recaptcha;
        if (!recaptcha) {
            throw new BadRequestError('no recaptcha response key', 403);
        } else {
            // Check for humanness (reCAPTCHA by Google)
            let options = {
                url: 'https://www.google.com/recaptcha/api/siteverify',
                method: 'POST',
                json: {
                    secret: config.security.recaptchaSecret,
                    response: recaptcha
                }
            };

            let result = yield request(options);
            result = JSON.parse(result.body);

            if (!result.success) {
                throw new BadRequestError('humanness was not verified', 403);
            }

            yield next;
        }
    }
};

/**
 * Passport authentication layer
 */
module.exports.passport = function () {
    let LocalStrategy = require('passport-local').Strategy;
    let passport      = require('koa-passport');

    /**
     * Passport function for serializing user. Might not need in the future.
     */
    let serialize = function (user, done) {
        done(null, user.id);
    };

    /**
     * Passport function for deserializing user. Might not need in the future.
     */
    let deserialize = function (id, done) {
        co(function *() {
            let user = User.findById(id);
            if (user) {
                done(null, user);
            } else {
                done(null, false, { message: 'Cannot retrieve user with the provided ID' });
            }
        });
    };

    /**
     * Local strategy login logic
     */
    let applyteLogin = function (username, password, done) {
        co(function *() {
            return yield User.matchUser(username, password);
        })
        .then(function (user) {
            done(null, user);
        })
        .catch(function (err) {
            done(null, false, { message: err.message });
        });
    };

    passport.use(new LocalStrategy(applyteLogin));
    passport.serializeUser(serialize);
    passport.deserializeUser(deserialize);
};
