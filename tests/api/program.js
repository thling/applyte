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

describe('Program API Routes', function () {
    describe('Basic API access test', function () {
        let createdId, program, template = master.program.template;

        after('clean up database', function *() {
            program = yield Program.findById(createdId);
            program.setSaved();
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
        let compsci, mecheng, indseng, management, philosophy;
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

            programs = [compsci, mecheng, indseng, management, philosophy];
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
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, programs);
                    }

                    done();
                });
        });

        it('should list every program with the school they belong to', function (done) {
            request()
                .get('/api/programs?school=true')
                .expect(200)
                .expect('Content-Type', /json/)
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
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(res.body, [compsci, indseng, mecheng, management]);
                            }

                            done();
                        });
                }
        );

        it('should list 3rd to 5th item in alphabetical order (MGMT, ME, PHIL)',
                function (done) {
                    request()
                        .get('/api/programs?start=3&limit=3')
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(res.body, [management, mecheng, philosophy]);
                            }

                            done();
                        });
                }
        );

        it('should list 4th to 2nd item in alphabetical order (ME, MGMT, IE)', function (done) {
            request()
                .get('/api/programs?start=1&limit=3&order=desc')
                .expect(200)
                .expect('Content-Type', /json/)
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
                                + '&areas='+areas
                                + '&level=' + level
                                + '&faculty=' + faculty
                                + '&order=desc'
                                + '&school=true')
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                let tmp = _.pick(management, fields);
                                tmp.school = purdue;
                                master.listEquals(res.body, [tmp]);
                            }

                            done();
                        });
                }
        );

        it('should update the data with PUT request to /api/programs', function (done) {
            let temp = master.program.template,
                newData = _.pick(temp, ['id', 'name', 'areas']);

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

        it('should not be able to delete a program without privilege', function (done) {
            request()
                .delete('/api/programs')
                .send({ id: compsci.id })
                .expect(403, done);
        });

        it('should be able to delete a program with proper prvilege', function (done) {
            request()
                .delete('/api/programs')
                .set('access_token', 'anythingfortest')
                .send({ id: compsci.id, apiKey: 'test' })
                .expect(204, done);
        });
    });
});
