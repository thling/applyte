'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let _          = require('lodash');
let superagent = require('supertest');
let app        = require('../../app');
let master     = require('../test-master');
let User       = require('../../models/user');

require('chai').should();
require('co-mocha');

/**
 * Creates superagent function, allows us to test HTTP requests
 *
 * p.s. Don't use supertest and this function in tests that don't
 *      require HTTP requests tests. Also don't need to require app
 *      for tests that doesn't require client-server communications
 */

let agency = function () {
    return superagent.agent(app.listen());
};

describe('Authentication test', function () {
    let agent;
    let createdId, csrf, token;
    let password = 'this is a password';
    let username = 'sam@thling.com';

    before('Set up', function () {
        agent = agency();
    });

    after('Clean up database', function *() {
        let foundUser = yield User.findById(createdId);
        yield foundUser.delete();
    });

    describe('Signup request', function () {
        let user;

        before('Set up data', function () {
            user = master.user.template;
            user.newPassword = password;
            user = _.omit(
                    user,
                    ['created', 'modified', 'accessRights', 'verified', 'password']
            );
        });


        it('should obtain a csrf token', function (done) {
            agent
                .get('/api/auth/tokens')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('_csrf');
                    csrf = res.body._csrf;
                    done();
                });
        });

        it('it should signup properly', function (done) {
            agent
                .post('/api/auth/signup')
                .set('x-csrf-token', csrf)
                .send(user)
                .expect(201)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('id');
                    createdId = res.body.id;

                    done();
                });
        });
    });

    describe('Login request', function () {
        it('should be able to login using the CSRF token', function (done) {
            agent
                .post('/api/auth/login')
                .set('x-csrf-token', csrf)
                .send({
                    username: username,
                    password: password
                })
                .expect(201)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('accessToken');
                    res.body.should.have.property('message', 'Logged in');
                    token = res.body.accessToken;
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

                    res.body.should.have.property('message', 'invalid csrf token');
                    done();
                });
        });

        it('should respond 401 if username does not exist', function (done) {
            agent
                .post('/api/auth/login')
                .set('x-csrf-token', csrf)
                .send({
                    username: 'random@user.com',
                    password: password
                })
                .expect(401, done);
        });

        it('should respond 401 if password is wrong', function (done) {
            agent
                .post('/api/auth/login')
                .set('x-csrf-token', csrf)
                .send({
                    username: username,
                    password: 'bad password'
                })
                .expect(401, done);
        });
    });

    describe('Token tests', function () {
        it('should extend token TTL with /api/auth/tokens/refresh', function (done) {
            agent
                .put('/api/auth/tokens/refresh')
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('accessToken');

                    let jwt = require('koa-jwt');
                    try {
                        let decodedOrig = jwt.decode(token);
                        let decodedNew = jwt.decode(res.body.accessToken);
                        decodedNew.exp.should.be.at.least(decodedOrig.exp);
                    } catch (error) {
                        throw new Error('new token was not extended');
                    }

                    done();
                });
        });

        it('should receive 200 from /api/auth/tokens/refresh if we have a valid token',
            function (done) {
                agent
                    .post('/api/auth/tokens/test')
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }

                        res.body.should.have.property('message', 'Authorized');
                        res.body.should.be.an('object').with.property('user');
                        done();
                    });
            }
        );
    });
});
