'use strict';

let LocalStrategy = require('passport-local').Strategy;
let passport      = require('koa-passport');

passport.use(new LocalStrategy(function (username, password, done) {
    done(null, false);
}));
