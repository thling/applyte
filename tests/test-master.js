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
            password: {
                hash: null,
                salt: null
            },
            name: {
                first: 'Tzu',
                middle: 'Hsuan',
                last: 'Ling',
                preferred: 'Sam'
            },
            birthday: new Date(1990, 11, 4),
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
        assert.deepEqual(user.birthday, test.birthday);
        assert.deepEqual(user.created, test.created);

        assert.deepEqual(user.name, test.name);
        assert.deepEqual(user.password, test.password);
        assert.deepEqual(user.contact, test.contact);
    }
};
