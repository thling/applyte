'use strict';

/**
 * Do not use. This entire content may be removed.
 * This is subject to further research
 */

let co            = require('co');
let LocalStrategy = require('passport-local').Strategy;
let passport      = require('koa-passport');
let User          = require(basedir + 'models/user');

let serialize = function (user, done) {
    done(null, user.id);
};

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

let applyteLogin = function (username, password, done) {
    co(function *() {
        return yield User.matchUser(username, password);
    })
    .then(done)
    .catch(function (err) {
        done(null, false, { message: err.message });
    });
};

passport.use(new LocalStrategy(applyteLogin));
passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

module.exports = passport;
