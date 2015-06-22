'use strict';

// Setting node environment to 'test' for testing will
// temporarily disable logging on request and response
// in the terminal. If you don't like this, comment out
// this line
process.env.NODE_ENV = 'test';

let superagent = require('supertest');
let app        = require('../app');

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

describe('API Routing tests', function () {
    describe('Outer API Routes', function () {
        describe('GET /api', function () {
            it('should return 404', function (done) {
                request()
                    .get('/api')
                    .expect(404, done);
            });
        });
    });
});
