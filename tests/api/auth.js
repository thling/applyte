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

let agency = function () {
    return superagent.agent(app.listen());
};

describe('Authentication test', function () {
    let createdId;
    after('Clean up database', function *() {
        let foundUser = yield User.findById(createdId);
        yield foundUser.delete();
    });

    describe('Signup request', function () {
        let agent, csrf, user;

        before('Set up data', function () {
            agent = agency();
            user = master.user.template;
            user.newPassword = 'this is a password';
            user = _.omit(
                    user,
                    ['created', 'modified', 'accessRights', 'verified', 'password']
            );
        });


        it('should obtain a csrf token', function (done) {
            agent
                .get('/api/auth/signup')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert(res.body._csrf);
                    csrf = res.body._csrf;
                    done();
                });
        });

        it('it should signup properly', function (done) {
            agent
                .post('/api/auth/signup')
                .set('x-csrf-token', csrf)
                .send(user)
                .expect(301)
                .expect('location', '/api/users')
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    agent
                        .post(res.header.location)
                        .set('x-csrf-token', csrf)
                        .send(user)
                        .expect(201)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }

                            assert(res.body.id);
                            createdId = res.body.id;
                            done();
                        });
                });
        });
    });

    describe('Login request', function () {
        let agent = agency();
        let csrf;

        it('should generate a proper csrf token', function (done) {
            agent
                .get('/api/auth/login')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert(res.body._csrf);
                    csrf = res.body._csrf;
                    done();
                });
        });

        it('should be able to login using the CSRF token', function (done) {
            agent
                .post('/api/auth/login')
                .set('x-csrf-token', csrf)
                .send({
                    username: 'sam@thling.com',
                    password: 'this is a password'
                })
                .expect(201)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.strictEqual(res.body.message, 'Logged in');
                    done();
                });
        });

        it('should fail logging in if CSRF token is invalid', function (done) {
            agent
                .post('/api/auth/login')
                .set('x-csrf-token', csrf + 'lala')
                .expect(403)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    assert.strictEqual(res.body.message, 'invalid csrf token');
                    done();
                });
        });

        it('should respond 401 if password is wrong', function (done) {
            agent
                .post('/api/auth/login')
                .set('x-csrf-token', csrf)
                .send({
                    username: 'sam@thling.com',
                    password: 'bad password'
                })
                .expect(401, done);
        });
    });
});
