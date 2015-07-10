'use strict';

let co            = require('co');
let LocalStrategy = require('passport-local').Strategy;
let passport      = require('koa-passport');
let User          = require(basedir + 'models/user');

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
