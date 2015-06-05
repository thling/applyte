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

        it('should create a new program with /api/program/create', function (done) {
            request()
                .post('/api/program/create')
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

        it('should return the saved program with /api/program/id', function (done) {
            request()
                .get('/api/program/id/' + createdId)
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

        it('should return the same thing with /api/program/name', function (done) {
            let name = encodeURI(template.name);

            request()
                .get('/api/program/name/' + name)
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
        let programs;

        before('setting up data', function *() {
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

            indseng.removeArea('Databases');
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
        });

        it('should list everything', function (done) {
            request()
                .get('/api/program/list')
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

        it('should find programs that have areas in both [Database, Systems] categories',
                function (done) {
                    let categories = encodeURI('Database||Systems');
                    request()
                        .get('/api/program/categories/' + categories)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                master.listEquals(
                                        res.body,
                                        [compsci, mecheng, management, philosophy]
                                );
                            }

                            done();
                        });
                }
        );

        it('should list 3rd to 5th item in alphabetical order (MGMT, ME, PHIL)',
                function (done) {
                    request()
                        .get('/api/program/list/3/3')
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
                .get('/api/program/list/1/3/desc')
                .expect('Content-Type', /json/)
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

        it('should update the data with /api/program/update', function (done) {
            let temp = master.program.template,
                newData = _.pick(temp, ['id', 'name', 'areas']);

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
                .put('/api/program/update')
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
                .delete('/api/program/delete')
                .send({ id: compsci.id })
                .expect(403, done);
        });

        it('should be able to delete a program with proper prvilege', function (done) {
            request()
                .delete('/api/program/delete')
                .send({ id: compsci.id, apiKey: 'test' })
                .expect(204, done);
        });
    });
});
