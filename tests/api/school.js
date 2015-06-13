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

describe('School API Routes', function () {
    describe('Basic API access test', function () {
        let createdId, school, template = master.school.template;

        after('clean up database', function *() {
            school = yield School.findById(createdId);
            school.setSaved();
            yield school.delete();
        });

        it('should create a new School with POST request to /api/schools', function (done) {
            request()
                .post('/api/schools')
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

        it('should return the saved School with /api/schools/id', function (done) {
            request()
                .get('/api/schools/' + createdId)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.school.assertEqual(res.body, template);
                    }

                    done();
                });
        });

        it('should return the same thing with /api/schools?name', function (done) {
            let name = encodeURI(template.name);

            request()
                .get('/api/schools?name=' + name)
                .expect(200)
                .expect('Content-Type', /json/)
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
        let purdueWL, purdueCal, uiuc, umich, bu, mit, emerson;
        let schools, programs;

        before('setting up data', function *() {
            purdueWL = new School(master.school.template);
            purdueCal = new School(master.school.template);
            uiuc = new School(master.school.template);
            umich = new School(master.school.template);
            bu = new School(master.school.template);
            emerson = new School(master.school.template);
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

            bu.update({
                name: 'Boston University',
                campus: 'Boston',
                address: {
                    city: 'Boston',
                    state: 'Massachusetts'
                }
            });

            emerson.update({
                name: 'Emerson College',
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
            yield emerson.save();
            yield mit.save();

            schools = [bu, emerson, mit, purdueCal, purdueWL, uiuc, umich];

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

            compsci.schoolId = purdueWL.id;
            mecheng.schoolId = purdueWL.id;
            indseng.schoolId = purdueWL.id;
            management.schoolId = uiuc.id;
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

        it('should return the school with /api/schools/name/campus', function (done) {
            let name = encodeURI(purdueWL.name);
            let campus = encodeURI(purdueWL.campus);

            request()
                .get('/api/schools/' + name + '/' + campus)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.school.assertEqual(res.body, purdueWL);
                    }

                    done();
                });
        });

        it('should list everything', function (done) {
            request()
                .get('/api/schools')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, schools);
                    }

                    done();
                });
        });

        it('should list 4th to 6th item in alphabetical order (PUWL, PUCal, UIUC)', function (done) {
            request()
                .get('/api/schools?start=4&limit=3')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [purdueWL, purdueCal, uiuc]);
                    }

                    done();
                });
        });

        it('should list 4th to 2nd item in alphabetical order (PUCal, MIT, EMER)', function (done) {
            request()
                .get('/api/schools?start=4&limit=3&order=desc')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [purdueCal, mit, emerson]);
                    }

                    done();
                });
        });

        it('should find schools in United States', function (done) {
            let country = encodeURI(bu.address.country);

            request()
                .get('/api/schools?country=' + country)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, schools);
                    }

                    done();
                });
        });

        it('should find schools in Massachusetts, US', function (done) {
            let country = encodeURI(bu.address.country);
            let state = encodeURI(bu.address.state);

            request()
                .get('/api/schools?country=' + country + '&state=' + state)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [bu, emerson, mit]);
                    }

                    done();
                });
        });

        it('should find schools in state MA', function (done) {
            let state = encodeURI(bu.address.state);

            request()
                .get('/api/schools?state=' + state)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [bu, emerson, mit]);
                    }

                    done();
                });
        });

        it('should find schools in Boston, MA, US (?country=*&state=*&city=*)', function (done) {
            let country = encodeURI(bu.address.country);
            let state = encodeURI(bu.address.state);
            let city = encodeURI(bu.address.city);

            request()
                .get('/api/schools?country=' + country + '&state=' + state + '&city=' + city)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [bu, emerson]);
                    }

                    done();
                });
        });

        it('should find schools in Boston, MA, US (/country/state/city)', function (done) {
            let country = encodeURI(bu.address.country);
            let state = encodeURI(bu.address.state);
            let city = encodeURI(bu.address.city);

            request()
                .get('/api/schools/location/' + country + '/' + state + '/' + city)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [bu, emerson]);
                    }

                    done();
                });
        });

        it('should return all programs Purdue has (by ID)', function (done) {
            request()
                .get('/api/schools/' + purdueWL.id + '/programs')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [compsci, mecheng, indseng]);
                    }

                    done();
                });
        });

        it('should return all programs Purdue has (by name + campus)', function (done) {
            let name = encodeURI(purdueWL.name);
            let campus = encodeURI(purdueWL.campus);
            request()
                .get('/api/schools/' + name + '/' + campus + '/programs')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [compsci, mecheng, indseng]);
                    }

                    done();
                });
        });

        it('should return fields [id, name, campus] of the schools that are located '
                + 'in Boston, MA, US, limit 1, start at 2, and sorted descendingly',
                function (done) {
                    let fields = ['id', 'name', 'campus'];
                    let queryFields = encodeURI(fields.join('||'));
                    let country = encodeURI('United States of America');
                    let state = encodeURI('Massachusetts');
                    let city = encodeURI('Boston');

                    request()
                        .get('/api/schools?fields=' + queryFields
                                + '&country=' + country
                                + '&state=' + state
                                + '&city=' + city
                                + '&limit=1'
                                + '&start=2'
                                + '&order=desc')
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            } else {
                                let tempBu = _.pick(bu, fields);
                                master.listEquals(res.body, [tempBu]);
                            }

                            done();
                        });
                }
        );

        it('should update the data with PUT request to /api/schools', function (done) {
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
                .put('/api/schools')
                .send(newData)
                .expect(200)
                .expect('Content-Type', /json/)
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
                .delete('/api/schools')
                .send({ id: purdueWL.id })
                .expect(403, done);
        });

        it('should be able to delete a school with proper prvilege', function (done) {
            request()
                .delete('/api/schools')
                .set('access_token', 'anythingfortest')
                .send({ id: purdueWL.id, apiKey: 'test' })
                .expect(204, done);
        });
    });
});
