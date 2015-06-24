'use strict';

let assert = require('assert');
let utils  = require('../../lib/utils');

describe('Library tests', function () {
    describe('utils.js tests', function () {
        describe('parseURI tests', function () {
            it('should return a proper object with uri parts', function () {
                let uri = 'http://sam:password@test.com:1234/this/is/random/path';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: 'http',
                    username: 'sam',
                    password: 'password',
                    host: 'test.com:1234',
                    hostname: 'test.com',
                    port: 1234,
                    path: '/this/is/random/path'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri without protocol', function () {
                let uri = 'test.com:1234/this/is/random/path';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: 'test.com:1234',
                    hostname: 'test.com',
                    port: 1234,
                    path: '/this/is/random/path'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri without host part', function () {
                let uri = '/this/is/random/path';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: undefined,
                    hostname: undefined,
                    port: undefined,
                    path: '/this/is/random/path'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri with localhost', function () {
                let uri = 'localhost/this/is/random/path';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: 'localhost',
                    hostname: 'localhost',
                    port: undefined,
                    path: '/this/is/random/path'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri without path part', function () {
                let uri = 'test.com';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: 'test.com',
                    hostname: 'test.com',
                    port: undefined,
                    path: undefined
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri with direct query', function () {
                let uri = 'test.com:3000?test=333';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: 'test.com:3000',
                    hostname: 'test.com',
                    port: 3000,
                    path: '?test=333'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri with query in endpoints', function () {
                let uri = 'test.com/api?test=333';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: uri,
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: 'test.com',
                    hostname: 'test.com',
                    port: undefined,
                    path: '/api?test=333'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri with query in endpoints', function () {
                let uri = '';
                let parsed = utils.parseURI(uri);
                let expected = {
                    uri: '',
                    protocol: undefined,
                    username: undefined,
                    password: undefined,
                    host: undefined,
                    hostname: undefined,
                    port: undefined,
                    path: undefined
                };

                assert.deepEqual(parsed, expected);
            });
        });

        describe('parseQueryString tests', function () {
            it('should handle uri with single query', function () {
                let uri = 'test.com?test=333';
                let parsed = utils.parseQueryString(uri);
                let expected = {
                    test: '333'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri with multiple query', function () {
                let uri = 'test.com?test=333&blah=yo';
                let parsed = utils.parseQueryString(uri);
                let expected = {
                    test: '333',
                    blah: 'yo'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle uri with encodedURI', function () {
                let uri = 'test.com?test=333&name=John%20Doe';
                let parsed = utils.parseQueryString(uri);
                let expected = {
                    test: '333',
                    name: 'John Doe'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle full uri with encodedURI', function () {
                let uri = 'https://test.com:3000/api?test=333&name=John%20Doe';
                let parsed = utils.parseQueryString(uri);
                let expected = {
                    test: '333',
                    name: 'John Doe'
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle full uri with list values', function () {
                let uri = 'https://test.com:3000/api?test=333&name=John%20Doe%7C%7CBob%20Doeser';
                let parsed = utils.parseQueryString(uri);
                let expected = {
                    test: '333',
                    name: ['John Doe', 'Bob Doeser']
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle query strings alone', function () {
                let uri = 'test=333&name=John%20Doe%7C%7CBob%20Doeser';
                let parsed = utils.parseQueryString(uri);
                let expected = {
                    test: '333',
                    name: ['John Doe', 'Bob Doeser']
                };

                assert.deepEqual(parsed, expected);
            });

            it('should handle errornous empty string', function () {
                let uri = '';
                let parsed = utils.parseQueryString(uri);
                let expected = {};

                assert.deepEqual(parsed, expected);
            });

            it('should handle errornous query string', function () {
                let uri = '?&';
                let parsed = utils.parseQueryString(uri);
                let expected = {};

                assert.deepEqual(parsed, expected);
            });
        });

        describe('parseLinkHeader tests', function () {
            it('should return all self, next, prev when all presented', function () {
                let base = 'http://test.com/api';
                let self = '?start=100&limit=20';
                let prev = '?start=80&limit=20';
                let next = '?start=120&limit=20';

                let selfLink = '<' + base + self + '>; rel="self"';
                let prevLink = '<' + base + prev + '>; rel="prev"';
                let nextLink = '<' + base + next + '>; rel="next"';

                let full = prevLink + ', ' + selfLink + ', ' + nextLink;

                let parsed = utils.parseLinkHeader(full);
                let expected = {
                    self: '/api' + self,
                    prev: '/api' + prev,
                    next: '/api' + next
                };

                assert.deepEqual(parsed, expected);
            });

            it('should return only self, prev', function () {
                let base = 'http://test.com/api';
                let self = '?start=100&limit=20';
                let prev = '?start=80&limit=20';

                let selfLink = '<' + base + self + '>; rel="self"';
                let prevLink = '<' + base + prev + '>; rel="prev"';

                let full = prevLink + ', ' + selfLink;

                let parsed = utils.parseLinkHeader(full);
                let expected = {
                    self: '/api' + self,
                    prev: '/api' + prev
                };

                assert.deepEqual(parsed, expected);
            });

            it('should return all of self, prev and extra info', function () {
                let base = 'http://test.com/api';
                let self = '?start=100&limit=20';
                let prev = '?start=80&limit=20';
                let extra = '?test';

                let selfLink = '<' + base + self + '>; rel="self"';
                let prevLink = '<' + base + prev + '>; rel="prev"';
                let extraLink = '<' + base + extra + '>; rel="test"';

                let full = prevLink + ', ' + selfLink + ', ' + extraLink;

                let parsed = utils.parseLinkHeader(full);
                let expected = {
                    self: '/api' + self,
                    prev: '/api' + prev,
                    test: '/api' + extra
                };

                assert.deepEqual(parsed, expected);
            });

            it('should return all parsed information', function () {
                let base = 'http://test.com/api';
                let other1 = '?start=100&limit=20';
                let other2 = '?start=80&limit=20';

                let other1Link = '<' + base + other1 + '>; rel="self"';
                let other2Link = '<' + base + other2 + '>; rel="prev"';

                let full = other1Link + ', ' + other2Link;

                let parsed = utils.parseLinkHeader(full);
                let expected = {
                    self: '/api' + other1,
                    prev: '/api' + other2
                };

                assert.deepEqual(parsed, expected);
            });

            it('should return nothing if Link is empty', function () {
                let parsed = utils.parseLinkHeader('');
                let expected = {};

                assert.deepEqual(parsed, expected);
            });

            it('should return nothing if param is undefined', function () {
                let parsed = utils.parseLinkHeader();
                let expected = {};

                assert.deepEqual(parsed, expected);
            });
        });

        describe('composeLinkHeader tests', function () {
            it('should compose properly', function () {
                let links = {
                    'next': 'testnext/barp',
                    'prev': 'testprev/foop',
                    'self': 'test/foo/bar'
                };

                let header = utils.composeLinkHeader(links);
                assert.deepEqual(utils.parseLinkHeader(header), links);
            });

            it('should return nothing on empty param', function () {
                let links = {};
                let header = utils.composeLinkHeader(links);

                assert.strictEqual(header, '');
            });
        });
    });
});
