'use strict';

let _      = require('lodash');
let assert = require('assert');

/**
 * This file is strictly used as utilities for testing.
 */

// Sample address
let address = {
    address1: '610 Purdue Mall',
    address2: null,
    city: 'West Lafayette',
    state: 'Indiana',
    postalCode: '47907',
    country: 'United States of America'
};

/**
 * Verifies that two sets (list) of programs contain the same data
 *
 * @param   items   The first list to test
 * @param   tests   The second list to test
 * @param   print   Whether to print the items being compared
 * @throws  Assertion error if two lists differ
 */
module.exports.listEquals = function (items, tests, print) {
    assert.strictEqual(items.length, tests.length);
    let count = items.length;

    for (let item of items) {
        for (let test of tests) {
            if (test.id === item.id) {
                if (print) {
                    console.log(item);
                    console.log(test);
                }

                assert.deepEqual(item, test);
                count -= 1;
                break;
            }
        }
    }

    assert.strictEqual(count, 0, 'The lists do not match');
};

/**
 * For tests on School module
 */
module.exports.school = {
    get template() {
        return {
            name: 'Purdue University',
            campus: 'West Lafayette',
            desc: 'Better than IU in every aspect',
            email: 'test@email.com',
            phone: '+1 (765) 494-4600',
            logo: '',
            address: _.cloneDeep(address),
            links: [
                {
                     name: 'Official Website',
                     url: 'http://www.purdue.edu'
                },
                {
                     name: 'Admissions',
                     url: 'http://www.purdue.edu/admissions'
                }
            ]
        };
    },

    /**
     * Validates the school against the template
     *
     * @param   school  The school to validate
     * @throws  AssertionError if not valid
     */
    assertEqual: function (school, test) {
        assert(_.isObject(school), 'School is not an object');
        assert.strictEqual(school.name, test.name);
        assert.strictEqual(school.campus, test.campus);
        assert.strictEqual(school.desc, test.desc);
        assert.strictEqual(school.email, test.email);
        assert.strictEqual(school.phone, test.phone);
        assert.strictEqual(school.logo, test.logo);

        assert.deepEqual(school.address, test.address);
        assert.deepEqual(school.links, test.links);
    }
};

/**
 * For tests on Program module
 */
module.exports.program = {
    get template() {
        return {
            name: 'Computer Science',
            degree: 'Master of Science',
            level: 'Graduate',
            desc: 'The Department of Computer Sciences is good.',
            schoolId: '',
            department: 'Department of Computer Science',
            faculty: 'College of Science',
            areas: [
                {
                    name: 'Databases',
                    categories: ['Database', 'Systems']
                },
                {
                    name: 'Distributed System',
                    categories: ['Systems']
                },
                {
                    name: 'Information Security and Assurance',
                    categories: ['Security']
                }
            ],
            contact: {
                fax: '+1 (765) 494-0739',
                phone: '+1 (765) 494-6010',
                email: 'grad-info@cs.purdue.edu',
                address: _.cloneDeep(address)
            }
        };
    },

    /**
     * Validates the program against the template
     *
     * @param   prog    The prog to validate
     * @throws  AssertionError if not valid
     */
    assertEqual: function (prog, test) {
        assert(_.isObject(prog), 'Program is not a object');
        assert.strictEqual(prog.name, test.name);
        assert.strictEqual(prog.degree, test.degree);
        assert.strictEqual(prog.level, test.level);
        assert.strictEqual(prog.desc, test.desc);
        assert.strictEqual(prog.schoolId, test.schoolId);
        assert.strictEqual(prog.department, test.department);
        assert.strictEqual(prog.faculty, test.faculty);

        assert.deepEqual(prog.areas, test.areas);
        assert.deepEqual(prog.contact, test.contact);
    }
};

/**
 * For tests on AreaCategory module
 */
module.exports.areaCategory = {
    get template() {
        return {
            name: 'Security',
            desc: 'Research of security'
        };
    },

    /**
     * Validates the category against the template
     *
     * @param   cat     The category objecto validate
     * @throws  AssertionError if not valid
     */
    assertEqual: function (cat, test) {
        assert(_.isObject(cat), 'AreaCategory is not an object');
        assert.strictEqual(cat.name, test.name);
        assert.strictEqual(cat.desc, test.desc);
    }
};

/**
 * For tests on User module
 */
module.exports.user = {
    get template() {
        return {
            password: null,
            name: {
                first: 'Tzu',
                middle: 'Hsuan',
                last: 'Ling',
                preferred: 'Sam'
            },
            birthday: {
                year: 1990,
                month: 11,
                day: 4
            },
            contact: {
                email: 'sam@thling.com',
                phone: '+1 (765) 237-9196',
                address: _.cloneDeep(address)
            },
            accessRights: 'user',
            verified: true,
            created: new Date(2015, 6, 25, 4, 54, 42),
            modified: new Date(2015, 6, 25, 4, 54, 42)
        };
    },

    /**
     * Validates the user against the template
     *
     * @param   user    The category objecto validate
     * @throws  AssertionError if not valid
     */
    assertEqual: function (user, test) {
        assert(_.isObject(user), 'User is not an object');
        assert.strictEqual(user.accessRights, test.accessRights);
        assert.strictEqual(user.verified, test.verified);
        assert.strictEqual(user.password, test.password);

        assert.deepEqual(user.birthday, test.birthday);
        assert.deepEqual(user.created, test.created);
        assert.deepEqual(user.name, test.name);
        assert.deepEqual(user.contact, test.contact);
    }
};

/**
 * Get a test token for testing authentication related operations
 *
 * @param   agent   The supertest.agent instance
 * @param   cb      The callback function to receive the token and user id
 */
module.exports.getTestToken = function (agent, email, cb) {
    let csrf, token, user, userId;
    user = this.user.template;

    if (_.isFunction(email)) {
        cb = email;
        email = user.contact.email;
    } else {
        user.contact.email = email;
    }

    user.newPassword = 'this is password';
    user = _.omit(
            user,
            ['created', 'modified', 'accessRights', 'verified', 'password']
    );

    // Get CSRF token
    agent.get('/api/auth/tokens')
        .end(function (err, res) {
            if (err) {
                throw err;
            }

            // Signup with the CSRF token
            csrf = res.body._csrf;
            agent.post('/api/auth/signup')
                .set('x-csrf-token', csrf)
                .send(user)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    userId = res.body.id;

                    // Login and obtain access token
                    agent.post('/api/auth/login')
                        .set('x-csrf-token', csrf)
                        .send({
                            username: user.contact.email,
                            password: 'this is password'
                        })
                        .end(function (err, res) {
                            if (err) {
                                throw err;
                            }

                            token = res.body.accessToken;
                            cb(token, userId);
                        });
                });
        });
};

/**
 * Refresh the token. Generally used after setting the user
 * to be verified or admin.
 *
 * @param   agent   The agent instance to use
 * @param   token   The old token
 * @param   cb      The callback function, accepts one parameter
 *                  which is the new token
 */
module.exports.refreshToken = function (agent, token, cb) {
    agent.put('/api/auth/tokens/refresh')
        .set('Authorization', 'Bearer ' + token)
        .end(function (err, res) {
            if (err) {
                console.log(res.body.message);
                throw err;
            }

            cb(res.body.accessToken);
        });
};

/**
 * Set the user with ID userId to be an admin.
 *
 * @param   agent   The agent instance to use
 * @param   userId  The user to make admin
 * @param   cb      The callback function, accepts nothing
 */
module.exports.makeAdmin = function (agent, userId, cb) {
    agent.put('/api/users/' + userId + '/makeAdmin')
        .end(function (err) {
            if (err) {
                throw err;
            }

            cb();
        });
};

/**
 * Set the user with ID userId to be a verified user.
 *
 * @param   agent   The agent instance to use
 * @param   userId  The user to set verified
 * @param   cb      The callback function, accepts nothing
 */
module.exports.setVerified = function (agent, userId, cb) {
    agent.put('/api/users/' + userId + '/verify')
        .end(function (err) {
            if (err) {
                throw err;
            }

            cb();
        });
};
