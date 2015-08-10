'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let basedir    = '../../';
let _          = require('lodash');
let assert     = require('assert');
let superagent = require('supertest');
let app        = require(basedir + 'app');
let Faculty    = require(basedir + 'models/faculty');
let master     = require(basedir + 'tests/test-master');
let Program    = require(basedir + 'models/program');
let School     = require(basedir + 'models/school');
let User       = require(basedir + 'models/user');
let utils      = require(basedir + 'lib/utils');

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
    let agent, token, userId;

    before('Set up environment', function *(done) {
        // Setup user token - need an admin token
        agent = agency();
        master.getTestToken(agent, function (tok, id) {
            userId = id;
            master.setVerified(agent, id, function () {
                master.makeAdmin(agent, id, function () {
                    master.refreshToken(agent, tok, function (newToken) {
                        token = newToken;
                        done();
                    });
                });
            });
        });
    });

    after('clean up area categories and user', function *() {
        let foundUser = yield User.findById(userId);
        yield foundUser.delete();
    });

    describe('Basic API access test', function () {
        let createdId, program, template = master.program.template;
        let sammyId, schoolId;
        let sammy = master.faculty.template;

        before('set up school', function *() {
            let school = master.school.template;
            yield School.save(school);
            schoolId = school.id;
            template.schoolId = schoolId;
        });

        after('clean up database', function *() {
            program = yield Program.findById(createdId);
            yield program.delete();

            let school = yield School.findById(schoolId);
            yield school.delete();

            yield (yield Faculty.findById(sammyId)).delete();
        });

        it('should create a new program with POST request to /api/programs', function (done) {
            template.areas = [
                {
                    name: 'Beastality',
                    desc: 'The study of beastness',
                    faculties: [sammy]
                }
            ];

            request()
                .post('/api/programs')
                .set('Authorization', 'Bearer ' + token)
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
                        sammyId = res.body.areas[0].faculties[0];
                        template.areas[0].faculties[0] = sammyId;
                        master.program.assertEqual(res.body, template);
                        done();
                    }
                });
        });

        it('should have created Sammy faculty as well', function *() {
            let foundSammy = yield Faculty.findById(sammyId);
            sammy.name.middle = '';
            master.faculty.assertEqual(foundSammy, sammy);
            sammy.id = foundSammy.id;
        });

        it('should update the program with PUT request to /api/programs', function (done) {
            sammy.name.first = 'NOOOOOOO';
            template.areas[0].faculties = [sammy];
            template.id = createdId;
            template.level = 'phd';

            request()
                .put('/api/programs')
                .send(template)
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        assert.strictEqual(res.body.new.level, template.level);
                        request()
                            .get('/api/programs/' + createdId)
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                } else {
                                    assert.strictEqual(res.body.level, template.level);
                                }

                                done();
                            });
                    }

                });
        });

        it('should have updated the faculty as well when updating program', function *() {
            let foundSammy = yield Faculty.findById(sammyId);
            sammy.name.middle = '';
            master.faculty.assertEqual(foundSammy, sammy);
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
                        template.areas[0].faculties[0] = sammyId;
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

        let donny = new Faculty(master.faculty.template),
            sammy = new Faculty(master.faculty.template);

        before('setting up data', function *() {
            donny.name = {
                first: 'Donny',
                last: 'Joe'
            };

            yield donny.save();
            yield sammy.save();

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

            compsci.ranking.rank = 1;
            mecheng.ranking.rank = 2;
            indseng.ranking.rank = 3;
            management.ranking.rank = 4;
            philosophy.ranking.rank = 5;

            compsci.financials.tuition = 10000;
            mecheng.financials.tuition = 50000;
            indseng.financials.tuition = 30000;
            management.financials.tuition = 20000;
            philosophy.financials.tuition = 15400;

            compsci.deadlines = [{
                semester: 'Spring 2016',
                deadline: new Date(2015, 10, 1).toISOString()
            }];

            mecheng.deadlines = [{
                semester: 'Spring 2016',
                deadline: new Date(2015, 6, 1).toISOString()
            }];

            indseng.deadlines = [{
                semester: 'Spring 2016',
                deadline: new Date(2015, 7, 1).toISOString()
            }];

            management.deadlines = [{
                semester: 'Spring 2016',
                deadline: new Date(2015, 1, 1).toISOString()
            }];

            philosophy.deadlines = [{
                semester: 'Spring 2016',
                deadline: new Date(2015, 11, 1).toISOString()
            }];

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
            yield sammy.delete();
            yield donny.delete();
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

        it('should list programs that have \'Databases\' '
                + 'or \'Information Security and Assurance\' areas',
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

        it('should sort by ranking', function (done) {
            request()
                .get('/api/programs?sort=rank&order=desc')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    master.listEquals(res.body, [philosophy, management, indseng, mecheng, compsci]);
                    done();
                });
        });

        it('should sort by ranking for computer science only', function (done) {
            let name = encodeURI('Computer Science');
            request()
                .get('/api/programs?sort=rank&order=desc&name=' + name)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    master.listEquals(res.body, [compsci]);
                    done();
                });
        });

        it('should return those tuition > 10000 and < 30000', function (done) {
            request()
                .get('/api/programs?tuition.gt=10000&tuition.lt=30000')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    master.listEquals(res.body, [management, philosophy]);
                    done();
                });
        });

        it('should return those deadline between 2015 05 01 and 2015 10 01', function (done) {
            let may = encodeURI(new Date(2015, 4, 1).toISOString());
            let oct = encodeURI(new Date(2015, 9, 1).toISOString());

            request()
                .get('/api/programs?deadline.gt=' + may + '&deadline.lt=' + oct)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    master.listEquals(res.body, [mecheng, indseng]);
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

        it('should update the data with PUT request to /api/programs', function (done) {
            let temp = master.program.template;
            let newData = _.pick(temp, ['id', 'name', 'areas']);

            temp.schoolId = purdue.id;

            newData.id = compsci.id;
            newData.name = 'Test Science';
            newData.financials = {
                tuition: 40000
            };
            newData.deadlines = [{
                semester: 'Spring 2016',
                deadline: new Date(2015, 11, 5).toISOString()
            }];
            newData.areas.push({
                    name: 'Systems Development',
                    desc: 'This is sys dev'
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
                    .expect(401, done);
            });
        });
    });
});
