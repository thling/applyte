'use strict';

let _      = require('lodash');
let assert = require('assert');
let utils  = require('../../lib/utils');

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

    describe('assertObjectSchema tests', function () {
        let goodObject = {
            a: 1,
            b: {
                b1: 2,
                b2: 3
            },
            c: [4, 5, 6, 7],
            d: 8
        };

        let noMissing = {
            noMissing: true,
            noExtra: false
        };

        let noExtra = {
            noMissing: false,
            noExtra: true
        };

        it('should detect missing field properly', function () {
            try {
                let badObject = {
                    a: 1,
                    b: {
                        b1: 2,
                        b2: 3
                    },
                    c: [4, 5, 6, 7]
                };

                utils.assertObjectSchema(badObject, goodObject, noMissing);
                throw new Error('Should not have gotten here');
            } catch (error) {
                assert.strictEqual(error.type, 'MissingPropertyError');
            }
        });

        it('should detect missing nested field properly', function () {
            try {
                let badObject = {
                    a: 1,
                    b: {
                        b1: 2
                    },
                    c: [3, 4, 5]
                };

                utils.assertObjectSchema(badObject, goodObject, noMissing);
                throw new Error('Should not have gotten here');
            } catch (error) {
                assert.strictEqual(error.type, 'MissingPropertyError');
            }
        });

        it('should ignore extra field when only missing field is checked', function () {
            let badObject = {
                a: 1,
                b: {
                    b1: 2,
                    b2: 3,
                    b3: 4
                },
                c: [5, 6, 7, 8],
                d: 9
            };

            utils.assertObjectSchema(badObject, goodObject, noMissing);
        });

        it('should detect extra field properly', function () {
            try {
                let badObject = {
                    a: 1,
                    b: {
                        b1: 2,
                        b2: 3
                    },
                    c: [4, 5, 6, 7],
                    d: 8,
                    e: 9
                };

                utils.assertObjectSchema(badObject, goodObject, noExtra);
                throw new Error('Should not have gotten here');
            } catch (error) {
                assert.strictEqual(error.type, 'ExtraPropertyError');
            }
        });

        it('should detect nested extra field properly', function () {
            try {
                let badObject = {
                    a: 1,
                    b: {
                        b1: 2,
                        b2: 3,
                        b3: 4,
                        b4: 5
                    },
                    c: [6, 7, 8, 9, 10],
                    d: 11
                };

                utils.assertObjectSchema(badObject, goodObject, noExtra);
                throw new Error('Should not have gotten here');
            } catch (error) {
                assert.strictEqual(error.type, 'ExtraPropertyError');
            }
        });

        it('should ignore missing field when only extra field is checked', function () {
            let badObject = {
                a: 1,
                b: {
                    b1: 2,
                    b2: 3
                },
                d: 8
            };

            utils.assertObjectSchema(badObject, goodObject, noExtra);
        });
    });

    describe('diffObject tests', function () {
        let orig = {
            a: 1,
            b: 2,
            c: {
                c1: 3,
                c2: 4,
                c3: {
                    c31: 5,
                    c32: 6
                },
                c4: 7
            },
            d: [8, 9, 10, 11]
        };

        it('should handle empty second parameter', function () {
            let newval = {};
            let expected = {
                new: {},
                old: {}
            };

            let changed = utils.diffObjects(newval, orig);
            assert.deepEqual(changed, expected);
        });

        it('should handle empty first parameter', function () {
            let newval = {
                a: 3,
                b: 4
            };

            let expected = {
                new: {},
                old: {}
            };

            let changed = utils.diffObjects({}, newval);
            assert.deepEqual(changed, expected);
        });

        it('should diff basic changes', function () {
            let newval = _.cloneDeep(orig);
            newval.a = 'a hundred';
            newval.d = [8, 9, 10, 11, 12];

            let expected = {
                new: {
                    a: 'a hundred',
                    d: [8, 9, 10, 11, 12]
                },
                old: {
                    a: 1,
                    d: [8, 9, 10, 11]
                }
            };

            let changed = utils.diffObjects(newval, orig);
            assert.deepEqual(changed, expected);
        });

        it('should not be lied to by array references changes', function () {
            let newval = _.cloneDeep(orig);
            newval.a = 'a hundred';

            let expected = {
                new: {
                    a: 'a hundred'
                },
                old: {
                    a: 1
                }
            };

            let changed = utils.diffObjects(newval, orig);
            assert.deepEqual(changed, expected);
        });

        it('should diff complicated nested objects', function () {
            let newval = _.cloneDeep(orig);
            newval.c.c3.c32 = 60000;
            newval.c.c5 = {
                c51: 'c51',
                c52: ['1', '2']
            };
            newval.d = 10;
            newval.e = 'test';
            newval.f = {
                f1: 'ha',
                f2: {
                    f21: null,
                    f22: 0.44444
                }
            };

            let expected = {
                new: {
                    c: {
                        c3: {
                            c32: 60000
                        },
                        c5: {
                            c51: 'c51',
                            c52: ['1', '2']
                        }
                    },
                    d: 10,
                    e: 'test',
                    f: {
                        f1: 'ha',
                        f2: {
                            f21: null,
                            f22: 0.44444
                        }
                    }
                },
                old: {
                    c: {
                        c3: {
                            c32: 6
                        }
                    },
                    d: [8, 9, 10, 11]
                }
            };

            let changed = utils.diffObjects(newval, orig);
            assert.deepEqual(changed, expected);
        });
    });

    describe('assignDeep tests', function () {
        let orig = {
            a: 1,
            b: {
                b1: 2,
                b2: {
                    b21: 4,
                    b22: [5, 6, 7, 8]
                }
            },
            c: 9
        };

        it('should handle empty assigner', function () {
            let assigned = _.cloneDeep(orig);
            utils.assignDeep(assigned, {});

            assert.deepEqual(assigned, orig);
        });

        it('should handle empty assignee', function () {
            let data = {
                a: 3,
                b: 4
            };

            let assigned = {};
            utils.assignDeep(assigned, data);
            assert.deepEqual(assigned, data);
        });

        it('should properly assign basic items', function () {
            let data = {
                a: 3,
                c: 10
            };

            let assigned = _.cloneDeep(orig);
            utils.assignDeep(assigned, data);

            let expected = _.cloneDeep(orig);
            expected.a = 3;
            expected.c = 10;

            assert.deepEqual(assigned, expected);
        });

        it('should properly assign complicated nested items', function () {
            let data = {
                a: 1000,
                b: {
                    b1: 2000,
                    b2: {
                        b22: [4, 5, 6]
                    }
                },
                c: 'test',
                d: 10000
            };

            let assigned = _.cloneDeep(orig);
            utils.assignDeep(assigned, data);

            let expected = _.cloneDeep(orig);
            expected.a = 1000;
            expected.b.b1 = 2000;
            expected.b.b2.b22 = [4, 5, 6];
            expected.c = 'test';
            expected.d = 10000;

            assert.deepEqual(assigned, expected);
        });
    });
});
