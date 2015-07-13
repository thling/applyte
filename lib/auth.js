'use strict';

let co     = require('co');
let errors = require(basedir + 'lib/errors');
let User   = require(basedir + 'models/user');

let UserNotAuthorizedError = errors.UserNotAuthorizedError;

module.exports.authenticator = {
    verified: function *(next) {
        let user = this.state.user;
        if (user && user.verified) {
            yield next;
        } else {
            throw new UserNotAuthorizedError();
        }
    },

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
