'use strict';

let _       = require('lodash');
let request = require('koa-request');
let auth    = require(basedir + 'lib/auth');
let config  = require(basedir + 'config');
let errors  = require(basedir + 'lib/errors');
let User    = require(basedir + 'models/user');
let utils   = require(basedir + 'lib/utils');

let UserExistedError = errors.UserExistedError;

module.exports.createUser = function *() {
    let data = this.request.body;
    let recaptchaResponse = data.recatpchaResponse;

    // Trying to see if the recaptcha passed
    if (!recaptchaResponse) {
        this.status = 403;
        this.body = {
            message: 'Humanness was not verified'
        };
    } else {
        let options = {
            url: 'https://www.google.com/recaptcha/api/siteverify',
            method: 'POST',
            json: {
                secret: config.security.recaptchaSecret,
                response: recaptchaResponse
            }
        };

        let result = yield request(options);
        result = JSON.parse(result.body);

        if (!result.success) {
            this.status = 403;
            this.body = {
                message: 'Humanness was not verified'
            };
        } else {
            // Reject invalid input immediately
            let invalid = _.intersection(
                    _.keys(data),
                    ['id', 'created', 'modified', 'accessRights', 'verified', 'password']
            );

            // Check for missing fields
            let hasMissingFields = false;
            let requiredFields = ['name.first', 'name.last', 'contact.email'];
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
                    if (error instanceof UserExistedError) {
                        error.generateContext(this);
                    } else {
                        console.error(error);
                        this.status = 500;
                        this.body = { message: this.message };
                    }
                }
            }
        }
    }
};
