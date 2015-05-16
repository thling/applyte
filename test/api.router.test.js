'use strict';
var superagent = require('supertest');
var app = require('../app');

/**
 * Creates superagent function, allows us to test HTTP requests
 */
function request() {
    return superagent(app.listen());
}

describe('API Routing tests', function() {
    describe('Outer API Routes', function() {
        describe('GET /api', function(done) {
            it('Should return 404', function(done) {
                request()
                    .get('/api')
                    .expect(404, done);
            });
        });
    })

    describe('Program API Routes', function() {
        describe('GET /api/program', function() {
            it('Should return 404', function(done) {
                request()
                    .get('/')
                    .expect(404, done);
            });
        });
        describe('GET entire list from "/api/program/list"', function () {
            it('Should return 200 in JSON', function(done) {
                request()
                    .get('/api/program/list')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });
        });
        describe('GET by school id from "/api/program/school/id/232"', function () {
            it('Should return 200 in JSON', function(done) {
                request()
                    .get('/api/program/school/id/232')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });
        });
        describe('GET by school name from "/api/program/school/name/Purdue"', function() {
            it('Should return 200 in JSON', function(done) {
                request()
                    .get('/api/program/school/name/Purdue')
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });
        });
    });
});
