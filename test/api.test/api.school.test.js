'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let assert     = require('assert');
let _          = require('lodash');
let superagent = require('supertest');
let app        = require('../../app');
let master     = require('../test.master');
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

describe('School API Routes', function() {
    describe('Basic API access test', function () {
        let createdId, school, template = master.school.template;

        after('clean up database', function *() {
            school = yield School.findById(createdId);
            school.setSaved();
            yield school.delete();
        });

        it('should create a new School with /api/school/create', function (done) {
            request()
                .post('/api/school/create')
                .send(template)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    } else {
                        createdId = res.body.id;
                    }

                    done();
                });
        });

        it('should return the saved School with /api/school/id', function (done) {
            request()
                .get('/api/school/id/' + createdId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.school.assertEqual(res.body, template);
                    }

                    done();
                });
        });

        it('should return the same thing with /api/school/name', function (done) {
            let name = encodeURI(template.name);

            request()
                .get('/api/school/name/' + name)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.school.assertEqual(res.body[0], template);
                    }

                    done();
                });
        });
    });

    describe('Complex API access test', function () {
        let compsci, mecheng, indseng, management, philosophy;
        let purdueWL, purdueCal, uiuc, umich, bu, mit;
        let schools, programs;

        before('setting up data', function *() {
            purdueWL = new School(master.school.template);
            purdueCal = new School(master.school.template);
            uiuc = new School(master.school.template);
            umich = new School(master.school.template);
            bu = new School(master.school.template);
            mit = new School(master.school.template);

            purdueCal.update({
                campus: 'Calumet',
                address: {
                    city: 'Hammond'
                }
            });

            uiuc.update({
                name: 'University of Illinois',
                campus: 'Urbana-Champaign',
                address: {
                    city: 'Champaign',
                    state: 'Illinois'
                }
            });

            umich.update({
                name: 'University of Michigan',
                campus: 'Ann Arbor',
                address: {
                    city: 'Ann Arbor',
                    state: 'Michigan'
                }
            });

            bu.update( {
                name: 'Boston University',
                campus: 'Boston',
                address: {
                    city: 'Boston',
                    state: 'Massachusetts'
                }
            });

            mit.update({
                name: 'Massachusetts Institute of Technology',
                campus: 'Cambridge',
                address: {
                    city: 'Cambridge',
                    state: 'Massachusetts'
                }
            });

            yield purdueWL.save();
            yield purdueCal.save();
            yield uiuc.save();
            yield umich.save();
            yield bu.save();
            yield mit.save();

            schools = [bu, mit, purdueCal, purdueWL, uiuc, umich];

            compsci = new Program(master.program.template);
            mecheng = new Program(master.program.template);
            indseng = new Program(master.program.template);
            management = new Program(master.program.template);
            philosophy = new Program(master.program.template);

            compsci.name = 'Computer Science';
            compsci.schoolId = purdueWL.id;
            mecheng.name = 'Mechanical Engineering';
            mecheng.schoolId = purdueWL.id;
            indseng.name = 'Industrial Engineering';
            indseng.schoolId = purdueWL.id;
            management.name = 'Management';
            management.schoolId = uiuc.id;
            philosophy.name = 'Philosophy';
            philosophy.schoolId = mit.id;

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

            for (let sch of schools) {
                yield sch.delete();
            }
        });

        it('should list everything', function (done) {
            request()
                .get('/api/school/list')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, schools);
                    }

                    done();
                });
        });

        it('should list 3rd to 5th item in alphabetical order (PUWL, PUCal, UIUC)', function (done) {
            request()
                .get('/api/school/list/3/3')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [purdueWL, purdueCal, uiuc]);
                    }

                    done();
                });
        });

        it('should list 4th to 2nd item in alphabetical order (PUWL, PUCal, MIT)', function (done) {
            request()
                .get('/api/school/list/3/3/desc')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [purdueWL, purdueCal, mit]);
                    }

                    done();
                });
        });

        it('should return all programs Purdue has', function (done) {
            request()
                .get('/api/school/id/' + purdueWL.id + '/programs')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [compsci, mecheng, indseng]);
                    }

                    done();
                });
        }) ;

        it('should update the data with /api/school/update', function (done) {
            let temp = master.school.template,
                newData = _.pick(temp, ['id', 'name', 'campus']);

            newData.id = purdueWL.id;
            newData.name = 'Purrrrrdue University';
            newData.campus = 'Lafayette';

            // Record the expected POST feedback
            let oldValue = _.pick(purdueWL, _.keys(_.omit(newData, 'id')));
            let newValue = _.omit(newData, 'id');
            let changed = {
                id: purdueWL.id,
                old: oldValue,
                new: newValue
            };

            request()
                .put('/api/school/update')
                .send(newData)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        assert.deepEqual(res.body, changed);

                        _.assign(temp, newData);
                        School.get(purdueWL.id)
                            .then(function (found) {
                                master.school.assertEqual(found, temp);
                            }).catch(function (error) {
                                done(error);
                            });
                    }

                    done();
                });
        });

        it('should not be able to delete a school without privilege', function (done) {
            request()
                .delete('/api/school/delete')
                .send({ id: purdueWL.id })
                .expect(403, done);
        });

        it('should be able to delete a school with proper prvilege', function (done) {
            request()
                .delete('/api/school/delete')
                .send({ id: purdueWL.id, apiKey: 'test' })
                .expect(204, done);
        });
    });
});
