'use strict';

process.env.NODE_ENV = 'test';

let superagent = require('supertest');
let app        = require('../app');

require('co-mocha');

/**
 * Creates superagent function, allows us to test HTTP requests
 */
let request = function () {
    return superagent(app.listen());
};

describe('API Routing tests', function() {
    describe('Outer API Routes', function() {
        describe('GET /api', function() {
            it('should return 404', function (done) {
                request()
                    .get('/api')
                    .expect(404, done);
            });
        });
    });
});
