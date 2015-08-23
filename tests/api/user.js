'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let basedir    = '../../';
let _          = require('lodash');
let assert     = require('assert');
let co         = require('co');
let superagent = require('supertest');
let app        = require(basedir + 'app');
let master     = require(basedir + 'tests/test-master');
let Session    = require(basedir + 'models/session');
let User       = require(basedir + 'models/user');

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

describe('User API Routes', function () {
    const OMIT_FIELDS = ['created', 'modified', 'accessRights', 'verified', 'password'];
    let adminId, adminToken, agent, token, userId;

    before('Set up environment', function *(done) {
        // Setup user token - need an admin token
        agent = agency();

        // Generate test admin id and token
        master.getTestToken(agent, 'test@example.com', function (tok, id) {
            adminId = id;
            master.setVerified(agent, id, function () {
                master.makeAdmin(agent, id, function () {
                    master.refreshToken(agent, tok, function (newToken) {
                        adminToken = newToken;
                        done();
                    });
                });
            });
        });
    });

    after('clean up area categories and user', function *() {
        let adminUser = yield User.findById(adminId);
        yield adminUser.delete();
        yield Session.deleteAllSessions();
    });

    describe('Basic API access test', function () {
        let user;

        it('should create a new User with POST request to /api/users', function (done) {
            let temp = master.user.template;
            temp.newPassword = 'this is my secret';
            temp = _.omit(temp, OMIT_FIELDS);

            // Create a normal user
            request()
                .post('/api/users')
                .send(temp)
                .expect(201)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        if (!res.body.id || res.body.id === '') {
                            throw new Error('Response body does not contain ID of the created');
                        }

                        userId = res.body.id;
                        co(function *() {
                            // Make sure that the user is verified
                            user = yield User.findById(userId);
                            user.setVerified();
                            yield user.save();
                        });

                        // Try to login to obtain access token
                        let loginAgent = agency();
                        loginAgent
                            .get('/api/auth/tokens')
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }

                                loginAgent
                                    .post('/api/auth/login')
                                    .set('x-csrf-token', res.body._csrf)
                                    .send({
                                        username: temp.contact.email,
                                        password: 'this is my secret'
                                    })
                                    .end(function (err, res) {
                                        if (err) {
                                            throw err;
                                        }

                                        token = res.body.accessToken;
                                        done();
                                    });
                            });
                    }
                });
        });

        it('should reject POST requests with read only fields', function (done) {
            let temp = master.user.template;
            request()
                .post('/api/users')
                .send(temp)
                .expect(400)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        assert.strictEqual(res.body.message, 'Invalid request parameters');
                    }

                    done();
                });
        });

        it('should reject POST request if no new password is supplied to create user', function (done) {
            let temp = master.user.template;
            temp = _.omit(temp, OMIT_FIELDS);

            request()
                .post('/api/users')
                .send(temp)
                .expect(400)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        assert.strictEqual(res.body.message, 'Password not supplied');
                    }

                    done();
                });
        });

        it('should reject POST request if user with the same email already existed', function (done) {
            let temp = master.user.template;
            temp.newPassword = 'this is my secret';
            temp = _.omit(temp, OMIT_FIELDS);

            request()
                .post('/api/users')
                .send(temp)
                .expect(400)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.log(err.message);
                        throw err;
                    } else {
                        assert.strictEqual(
                            res.body.message,
                            'User with email ' + temp.contact.email + ' already existed'
                        );
                    }

                    done();
                });
        });

        it('should get the user by id', function (done) {
            request()
                .get('/api/users/' + userId)
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        let temp = master.user.template;
                        temp.password = user.password;
                        temp.created = user.created.toJSON();

                        master.user.assertEqual(res.body, temp);
                    }

                    done();
                });
        });

        it('should not get user by id if user id is not the same', function (done) {
            request()
                .get('/api/users/' + userId)
                .set('Authorization', 'Bearer ' + adminToken)
                .expect(403)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        assert.strictEqual(res.body.message, 'Forbidden');
                    }

                    done();
                });
        });

        it('should update user properly with PUT request', function *(done) {
            let update = {
                id: user.id,
                name: {
                    first: 'Tom',
                    preferred: 'John'
                },
                birthday: {
                    year: 1991,
                    month: 2,
                    day: 3
                }
            };

            let expected = {
                id: user.id,
                new: _.omit(update, 'id'),
                old: {
                    name: {
                        first: user.name.first,
                        preferred: user.name.preferred
                    },
                    birthday: user.birthday
                }
            };

            request()
                .put('/api/users')
                .set('Authorization', 'Bearer ' + token)
                .send(update)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        assert.deepEqual(res.body, expected);
                    }

                    done();
                });
        });

        it('should reject PUT request if the input is invalid', function (done) {
            let update = {
                id: user.id,
                name: {
                    first: 'Sam'
                },
                modified: 'hahaha',
                accessRights: 'admin'
            };

            request()
                .put('/api/users')
                .set('Authorization', 'Bearer ' + token)
                .send(update)
                .expect(400)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        assert.deepEqual(res.body.message, 'Invalid request parameters');
                    }

                    done();
                });
        });

        it('should reject PUT request if the input does not specify any id', function (done) {
            let update = {
                name: {
                    first: 'Sam'
                }
            };

            request()
                .put('/api/users')
                .set('Authorization', 'Bearer ' + token)
                .send(update)
                .expect(400)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        assert.deepEqual(res.body.message, 'Missing parameters: id');
                    }

                    done();
                });
        });

        it('should reject PUT request if the user id is not the same', function (done) {
            let update = {
                id: user.id,
                name: {
                    first: 'Sam'
                }
            };

            request()
                .put('/api/users')
                .set('Authorization', 'Bearer ' + adminToken)
                .send(update)
                .expect(403)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        assert.deepEqual(res.body.message, 'Forbidden');
                    }

                    done();
                });
        });

        it('should not be able to delete a user without privilege', function (done) {
            request()
                .delete('/api/users')
                .send({ id: user.id })
                .expect(401, done);
        });

        it('should be able to delete a user with proper prvilege', function (done) {
            request()
                .delete('/api/users')
                .set('Authorization', 'Bearer ' + adminToken)
                .send({ id: user.id })
                .expect(204, done);
        });
    });
});
