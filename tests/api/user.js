'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let _          = require('lodash');
let assert     = require('assert');
let superagent = require('supertest');
let app        = require('../../app');
let master     = require('../test-master');
let User       = require('../../models/user');
let utils      = require('../../lib/utils');

require('co-mocha');

/**
 * Creates superagent function, allows us to test HTTP requests
 *
 * p.s. Don't use supertest and this function in tests that don't
 *      require HTTP requests tests. Also don't need to require app
 *      for tests that doesn't require client-server communications
 */
let request = function () {
    return superagent(app.listen());
};

describe('User API Routes', function () {
    describe('Basic API access test', function () {
        let createdId, template = master.user.template;
        let user;

        after('clean up database', function *() {
            user = yield User.findById(createdId);
            user.setSaved();
            yield user.delete();
        });

        it('should create a new User with POST request to /api/users', function (done) {
            template.newPassword = 'this is my secret';
            template = _.omit(
                    template,
                    ['created', 'modified', 'accessRights', 'verified', 'password']
            );

            request()
                .post('/api/users')
                .send(template)
                .expect(201)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        createdId = res.body.id;
                    }

                    done();
                });
        });
    });
});
