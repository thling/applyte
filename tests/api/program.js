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
let Program    = require('../../models/program');
let School     = require('../../models/school');
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

let agency = function () {
    return superagent.agent(app.listen());
};

describe('Program API Routes', function () {
    describe('Basic API access test', function () {
        let createdId, program, template = master.program.template;

        after('clean up database', function *() {
            program = yield Program.findById(createdId);
            yield program.delete();
        });

        it('should create a new program with POST request to /api/programs', function (done) {
            request()
                .post('/api/programs')
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

        it('should return the saved program with /api/programs/id', function (done) {
            request()
                .get('/api/programs/' + createdId)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.program.assertEqual(res.body, template);
                    }

                    done();
                });
        });

        it('should return the same thing with /api/programs?name', function (done) {
            let name = encodeURI(template.name);

            request()
                .get('/api/programs?name=' + name)
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(
                    'Link',
                    '<http://applyte.io/api/programs?name=Computer%20Science&school=false'
                            + '&start=1&limit=10&sort=name&order=asc>; rel="self"'
                )
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.program.assertEqual(res.body[0], template);
                    }

                    done();
                });
        });
    });

    describe('Complex API access test', function () {
        let compsci, indseng, management, mecheng, philosophy;
        let purdue;
        let programs;

        before('setting up data', function *() {
            purdue = new School(master.school.template);
            yield purdue.save();

            compsci = new Program(master.program.template);
            mecheng = new Program(master.program.template);
            indseng = new Program(master.program.template);
            management = new Program(master.program.template);
            philosophy = new Program(master.program.template);

            compsci.name = 'Computer Science';
            mecheng.name = 'Mechanical Engineering';
            indseng.name = 'Industrial Engineering';
            management.name = 'Management';
            philosophy.name = 'Philosophy';

            compsci.schoolId = purdue.id;
            mecheng.schoolId = purdue.id;
            indseng.schoolId = purdue.id;
            management.schoolId = purdue.id;
            philosophy.schoolId = purdue.id;

            management.level = 'Undergraduate';
            management.degree = 'Bachelor of Business Administration';
            management.faculty = 'School of Engineering';
            mecheng.level = 'Undergraduate';
            mecheng.faculty = 'School of Engineering';

            indseng.removeArea('Databases');
            philosophy.removeArea('Databases');
            philosophy.removeArea('Information Security and Assurance');

            yield compsci.save();
            yield mecheng.save();
            yield indseng.save();
            yield management.save();
            yield philosophy.save();

            programs = [compsci, indseng, management, mecheng, philosophy];
        });

        after('cleaning up data', function *() {
            for (let prog of programs) {
                yield prog.delete();
            }

            yield purdue.delete();
        });

        it('should list everything', function (done) {
            request()
                .get('/api/programs')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(
                    'Link',
                    '<http://applyte.io/api/programs?school=false&'
                            + 'start=1&limit=10&sort=name&order=asc>; rel="self"'
                )
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, programs);
                    }

                    // Check if the link it returned is correct
                    let links = utils.parseLinkHeader(res.header.link);
                    request()
                        .get(links.self)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(res.body, programs);
                            }

                            done();
                        });
                });
        });

        it('should list every program with the school they belong to', function (done) {
            request()
                .get('/api/programs?school=true')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(
                    'Link',
                    '<http://applyte.io/api/programs?school=true&start=1&limit=10&sort=name&order=asc>; rel="self"'
                )
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        let temp = _.cloneDeep(programs);
                        for (let tmp of temp) {
                            tmp.school = purdue;
                        }

                        master.listEquals(res.body, temp);
                    }

                    done();
                });
        });

        it('should find programs from undergrad degree', function (done) {
            let level = encodeURI('Undergraduate');

            request()
                .get('/api/programs/level/' + level)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [mecheng, management]);
                    }

                    done();
                });
        });

        it('should find programs with \'Database\' area', function (done) {
            let area = encodeURI('Database');
            request()
                .get('/api/programs/area/' + area)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(
                                res.body,
                                [compsci, mecheng, management]
                        );
                    }

                    done();
                });
        });

        it('should find programs that have areas in both [Database, Systems] categories',
                function (done) {
                    let categories = encodeURI('Database||Systems');
                    request()
                        .get('/api/programs/categories/' + categories)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(
                                        res.body,
                                        [compsci, mecheng, management]
                                );
                            }

                            done();
                        });
                }
        );

        it('should list programs that have \'Databases\' '
                + 'or \'Information Security and Assurance areas\'',
                function (done) {
                    let areas = encodeURI('Databases||Information Security and Assurance');
                    request()
                        .get('/api/programs?areas=' + areas)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .expect(
                            'Link',
                            '<http://applyte.io/api/programs?'
                                    + 'areas=Databases%7C%7CInformation%20Security%20and%20Assurance&'
                                    + 'school=false&start=1&limit=10&sort=name&order=asc>; '
                                    + 'rel="self"'
                        )
                        .end(function (err, res) {
                            let expectedPrograms = [compsci, indseng, mecheng, management];
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(res.body, expectedPrograms);
                            }

                            // Check if the link it returned is correct
                            let links = utils.parseLinkHeader(res.header.link);
                            request()
                                .get(links.self)
                                .expect(200)
                                .expect('Content-Type', /json/)
                                .end(function (err, res) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        master.listEquals(res.body, expectedPrograms);
                                    }

                                    done();
                                });
                        });
                }
        );

        it('should list 3rd to 5th item in alphabetical order (MGMT, ME, PHIL)',
                function (done) {
                    request()
                        .get('/api/programs?start=3&limit=3')
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .expect(
                            'Link',
                            '<http://applyte.io/api/programs?school=false&'
                                    + 'start=1&limit=3&sort=name&order=asc>; rel="prev", '
                                    + '<http://applyte.io/api/programs?school=false&'
                                    + 'start=3&limit=3&sort=name&order=asc>; rel="self"'
                        )
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(res.body, [management, mecheng, philosophy]);
                            }

                            // Check if the link it returned is correct
                            let links = utils.parseLinkHeader(res.header.link);
                            request()
                                .get(links.prev)
                                .expect(200)
                                .expect('Content-Type', /json/)
                                .end(function (err, res) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        master.listEquals(res.body, [compsci, indseng, management]);
                                    }

                                    done();
                                });
                        });
                }
        );

        it('should list 4th to 2nd item in alphabetical order (ME, MGMT, IE)', function (done) {
            request()
                .get('/api/programs?start=1&limit=3&order=desc')
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(
                    'Link',
                    '<http://applyte.io/api/programs?school=false&'
                            + 'start=1&limit=3&sort=name&order=desc>; rel="self", '
                            + '<http://applyte.io/api/programs?school=false'
                            + '&start=4&limit=3&sort=name&order=desc>; rel="next"'
                )
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [philosophy, mecheng, management]);
                    }

                    done();
                });
        });

        it('should get the 2nd program with \'Database\' area that is Undergraduate '
                + 'level and whose faculty is School of Engineering, sorted desc, '
                + 'select only \'name\' and \'schoolId\', include actual school data',
                function (done) {
                    let fields = ['name', 'schoolId'];
                    let queryFields = encodeURI(fields.join('||'));
                    let areas = encodeURI('Databases');
                    let level = encodeURI('Undergraduate');
                    let faculty = encodeURI('School of Engineering');

                    request()
                        .get('/api/programs?start=2'
                                + '&fields=' + queryFields
                                + '&areas=' + areas
                                + '&level=' + level
                                + '&faculty=' + faculty
                                + '&order=desc'
                                + '&school=true')
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .expect(
                            'Link',
                            '<http://applyte.io/api/programs?fields=name%7C%7CschoolId'
                                    + '&areas=Databases&level=Undergraduate'
                                    + '&faculty=School%20of%20Engineering&school=true'
                                    + '&start=1&limit=10&sort=name&order=desc>; rel="prev", '
                                    + '<http://applyte.io/api/programs?fields=name%7C%7CschoolId'
                                    + '&areas=Databases&level=Undergraduate'
                                    + '&faculty=School%20of%20Engineering&school=true'
                                    + '&start=2&limit=10&sort=name&order=desc>; rel="self"'
                        )
                        .end(function (err, res) {
                            let tmp;

                            if (err) {
                                throw err;
                            } else {
                                tmp = _.pick(management, fields);
                                tmp.school = purdue;
                                master.listEquals(res.body, [tmp]);
                            }

                            // Check if the link it returned is correct
                            let links = utils.parseLinkHeader(res.header.link);
                            request()
                                .get(links.self)
                                .expect(200)
                                .expect('Content-Type', /json/)
                                .end(function (err, res) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        master.listEquals(res.body, [tmp]);
                                    }

                                    done();
                                });
                        });
                }
        );

        describe('Authentication based tests', function () {
            let agent, csrf, token, user, userId;

            before('Set up environment', function (done) {
                agent = agency();
                user = master.user.template;
                user.newPassword = 'this is password';
                user = _.omit(
                        user,
                        ['created', 'modified', 'accessRights', 'verified', 'password']
                );

                // Get CSRF token
                agent.get('/api/auth/tokens')
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }

                        // Signup with the CSRF token
                        csrf = res.body._csrf;
                        agent.post('/api/auth/signup')
                            .set('x-csrf-token', csrf)
                            .send(user)
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }

                                userId = res.body.id;
                                agent.put('/api/users/' + userId + '/makeAdmin')
                                    .end(function (err) {
                                        if (err) {
                                            throw err;
                                        }

                                        agent.put('/api/users/' + userId + '/verify')
                                            .end(function (err) {
                                                if (err) {
                                                    throw err;
                                                }

                                                // Login and obtain access token
                                                agent.post('/api/auth/login')
                                                    .set('x-csrf-token', csrf)
                                                    .send({
                                                        username: user.contact.email,
                                                        password: 'this is password'
                                                    })
                                                    .end(function (err, res) {
                                                        if (err) {
                                                            throw err;
                                                        }

                                                        token = res.body.accessToken;
                                                        done();
                                                    });
                                            });
                                    });
                            });
                    });
            });

            after('Clean up database', function *() {
                let foundUser = yield User.findById(userId);
                yield foundUser.delete();
            });

            it('should update the data with PUT request to /api/programs', function (done) {
                let temp = master.program.template;
                let newData = _.pick(temp, ['id', 'name', 'areas']);

                temp.schoolId = purdue.id;

                newData.id = compsci.id;
                newData.name = 'Test Science';
                newData.areas.push({
                        name: 'Systems Development',
                        categories: ['Systems', 'Security']
                });

                // Record the expected POST feedback
                let oldValue = _.pick(compsci, _.keys(_.omit(newData, 'id')));
                let newValue = _.omit(newData, 'id');
                let changed = {
                    id: compsci.id,
                    old: oldValue,
                    new: newValue
                };

                request()
                    .put('/api/programs')
                    .set('Authorization', 'Bearer ' + token)
                    .send(newData)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            assert.deepEqual(res.body, changed);
                            _.assign(temp, newData);

                            Program.get(compsci.id)
                                .then(function (found) {
                                    master.program.assertEqual(found, temp);
                                }).catch(function (error) {
                                    done(error);
                                });
                        }

                        done();
                    });
            });

            it('should delete the program', function (done) {
                agent
                    .delete('/api/programs')
                    .set('Authorization', 'Bearer ' + token)
                    .send({ id: compsci.id })
                    .expect(204, done);
            });
        });


        describe('Error tests', function () {
            it('should produce error because of bad start criteria', function (done) {
                request()
                    .get('/api/programs?start=-1')
                    .expect(422)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            assert.strictEqual(res.body.message, 'Invalid start: -1');
                        }

                        done();
                    });
            });

            it('should produce error because of bad limit criteria', function (done) {
                request()
                    .get('/api/programs?limit=-1')
                    .expect(422)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            assert.strictEqual(res.body.message, 'Invalid limit: -1');
                        }

                        done();
                    });
            });

            it('should produce error because of bad sort criteria', function (done) {
                request()
                    .get('/api/programs?sort=dne')
                    .expect(422)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            assert.strictEqual(res.body.message, 'Invalid sort: dne');
                        }

                        done();
                    });
            });

            it('should produce error because of bad order criteria', function (done) {
                request()
                    .get('/api/programs?order=dne')
                    .expect(422)
                    .expect('Content-Type', /json/)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        } else {
                            assert.strictEqual(res.body.message, 'Invalid order: dne');
                        }

                        done();
                    });
            });

            it('should not be able to delete a program without privilege', function (done) {
                request()
                    .delete('/api/programs')
                    .send({ id: compsci.id })
                    .expect(403, done);
            });
        });
    });
});
