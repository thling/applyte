'use strict';

let passport = require('koa-passport');
let errors   = require(basedir + 'lib/errors');

let BadRequestError = errors.BadRequestError;

/**
 * Request token API
 */
module.exports.requestToken = function *() {
    this.status = 200;
    this.body = {
        _csrf: this.csrf
    };
};

/**
 * Login API
 */
module.exports.login = function *() {
    try {
        this.assertCSRF();
        yield passport.authenticate('local', function *(err, user) {
            if (err) {
                throw err;
            }

            if (!user) {
                throw new BadRequestError('Bad login', 401);
            }
        });

        this.status = 201;
        this.body = {
            // TODO: Create JWT
            message: 'Logged in'
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
