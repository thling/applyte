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

describe('User API Routes', function () {
    const OMIT_FIELDS = ['created', 'modified', 'accessRights', 'verified', 'password'];

    describe('Basic API access test', function () {
        let createdId;
        let user;

        after('clean up database', function *() {
            yield user.delete();
        });

        it('should create a new User with POST request to /api/users', function (done) {
            let temp = master.user.template;
            temp.newPassword = 'this is my secret';
            temp = _.omit(temp, OMIT_FIELDS);

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

                        createdId = res.body.id;
                        User.get(createdId)
                        .then(function (data) {
                            user = data;
                            user.verified = true;
                            user.save();
                        });
                    }

                    done();
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
                .get('/api/users/' + createdId)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        console.error(res.body);
                        throw err;
                    } else {
                        let temp = master.user.template;
                        temp.birthday = temp.birthday.toJSON();
                        temp.password = user.password;
                        temp.created = user.created.toJSON();

                        master.user.assertEqual(res.body, temp);
                    }

                    done();
                });
        });

        it('should update user properly with PUT request', function *(done) {
            if (!user) {
                user = yield User.findById(createdId);
            }

            let update = {
                id: user.id,
                name: {
                    first: 'Tom',
                    preferred: 'John'
                },
                birthday: new Date(1991, 1, 3, 23, 34, 1).toJSON()
            };

            let expected = {
                id: user.id,
                new: _.omit(update, 'id'),
                old: {
                    name: {
                        first: user.name.first,
                        preferred: user.name.preferred
                    },
                    birthday: user.birthday.toJSON()
                }
            };

            request()
                .put('/api/users')
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

        it('should not be able to delete a user without privilege', function (done) {
            request()
                .delete('/api/users')
                .send({ id: user.id })
                .expect(403, done);
        });

        it('should be able to delete a user with proper prvilege', function (done) {
            request()
                .delete('/api/users')
                .set('access_token', 'anythingfortest')
                .send({ id: user.id, apiKey: 'test' })
                .expect(204, done);
        });
    });
});
