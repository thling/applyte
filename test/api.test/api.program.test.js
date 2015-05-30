'use strict';

process.env.NODE_ENV = 'test';

let superagent = require('supertest');
let app        = require('../../app');
let master     = require('../test.master');
let Program    = require('../../models/program');

require('co-mocha');

/**
 * Creates superagent function, allows us to test HTTP requests
 */
let request = function () {
    return superagent(app.listen());
};

describe('Program API Routes', function() {
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
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    createdId = res.body.id;
                    done();
                });
        });

        it('should return the saved program with /api/program/id', function (done) {
            request()
                .get('/api/program/id/' + createdId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
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
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
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
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, programs);
                    }

                    done();
                });
        });

        it('should list 3rd to 5th item in alphabetical order (MGMT, ME, PHIL)', function (done) {
            request()
                .get('/api/program/list/3/3')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [management, mecheng, philosophy]);
                    }

                    done();
                });
        });

        it('should list 4th to 2nd item in alphabetical order (ME, MGMT, IE)', function (done) {
            request()
                .get('/api/program/list/1/3/desc')
                // .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    } else {
                        master.listEquals(res.body, [philosophy, mecheng, management]);
                    }

                    done();
                });
        });
    });
});
