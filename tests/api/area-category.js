'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let _            = require('lodash');
let assert       = require('assert');
let superagent   = require('supertest');
let app          = require('../../app');
let AreaCategory = require('../../models/area-category');
let master       = require('../test-master');

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

describe('AreaCategory API Routes', function () {
    describe('Basic API access test', function () {
        let createdId, category, template = master.areaCategory.template;

        after('clean up database', function *() {
            category = yield AreaCategory.findById(createdId);
            category.setSaved();
            yield category.delete();
        });

        it('should create a new area category with /api/area-category/create', function (done) {
            request()
                .post('/api/area-category/create')
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

        it('should return the saved area category with /api/area-category/id', function (done) {
            request()
                .get('/api/area-category/id/' + createdId)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.areaCategory.assertEqual(res.body, template);
                    }

                    done();
                });
        });

        it('should return the same thing with /api/area-category/name', function (done) {
            let name = encodeURI(template.name);

            request()
                .get('/api/area-category/name/' + name)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.areaCategory.assertEqual(res.body, template);
                    }

                    done();
                });
        });
    });

    describe('Complex API access test', function () {
        let database, systems, network, security, literature;
        let categories;

        before('setting up data', function *() {
            database = new AreaCategory(master.areaCategory.template);
            systems = new AreaCategory(master.areaCategory.template);
            network = new AreaCategory(master.areaCategory.template);
            security = new AreaCategory(master.areaCategory.template);
            literature = new AreaCategory(master.areaCategory.template);

            database.name = 'Database';
            systems.name = 'Systems';
            network.name = 'Network';
            security.name = 'Security';
            literature.name = 'Literature';

            yield database.save();
            yield systems.save();
            yield network.save();
            yield security.save();
            yield literature.save();

            categories = [database, literature, network, security, systems];
        });

        after('cleaning up data', function *() {
            for (let cat of categories) {
                yield cat.delete();
            }
        });

        it('should list everything', function (done) {
            request()
                .get('/api/area-category/list')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, categories);
                    }

                    done();
                });
        });

        it('should list 2nd to 4th item in alphabetical order (LIT, NETWK, SECRTY)', function (done) {
            request()
                .get('/api/area-category/list/2/3')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [literature, network, security]);
                    }

                    done();
                });
        });

        it('should list 3rd to 1st item in alphabetical order (NETWK, LIT, DB)', function (done) {
            request()
                .get('/api/area-category/list/3/3/desc')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [network, literature, database]);
                    }

                    done();
                });
        });

        it('should update the data with /api/area-category/update', function (done) {
            let temp = master.areaCategory.template,
                newData = _.pick(temp, ['id', 'desc']);

            newData.id = security.id;
            newData.desc = 'The awesomeness of security '
                    + 'unleashed to the maximum and will '
                    + 'dominate the world with its awesomenss!';

            // Record the expected POST feedback
            let oldValue = _.pick(security, _.keys(_.omit(newData, 'id')));
            let newValue = _.omit(newData, 'id');
            let changed = {
                id: security.id,
                old: oldValue,
                new: newValue
            };

            request()
                .put('/api/area-category/update')
                .send(newData)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        assert.deepEqual(res.body, changed);
                        _.assign(temp, newData);

                        AreaCategory.get(security.id)
                            .then(function (found) {
                                master.areaCategory.assertEqual(found, temp);
                            }).catch(function (error) {
                                done(error);
                            });
                    }

                    done();
                });
        });

        it('should not be able to delete an area category without privilege', function (done) {
            request()
                .delete('/api/area-category/delete')
                .send({ id: security.id })
                .expect(403, done);
        });

        it('should be able to delete an area category with proper prvilege', function (done) {
            request()
                .delete('/api/area-category/delete')
                .set('access_token', 'anythingfortest')
                .send({ id: security.id, apiKey: 'test' })
                .expect(204, done);
        });
    });
});
