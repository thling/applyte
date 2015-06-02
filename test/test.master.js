'use strict';

let assert = require('assert');
let _      = require('lodash');

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
 * @param   progs   The first list to test
 * @param   tests   The second list to test
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
                assert.deepEqual(test, item);
                count -= 1;
                break;
            }
        }
    }

    assert.strictEqual(count, 0, 'The lists do not match');
};

/**
 * For tests on school
 */
module.exports.school = {
    get template() {
        return {
            name: 'Purdue University',
            campus: 'West Lafayette',
            desc: 'Better than IU in every aspect',
            email: 'null',
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
    assertEqual: function (school, temp) {
        assert(_.isObject(school), 'School is not an object');
        assert.strictEqual(school.name, temp.name);
        assert.strictEqual(school.campus, temp.campus);
        assert.strictEqual(school.desc, temp.desc);
        assert.strictEqual(school.email, temp.email);
        assert.strictEqual(school.phone, temp.phone);
        assert.strictEqual(school.logo, temp.logo);

        assert.deepEqual(school.address, temp.address);
        assert.deepEqual(school.links, temp.links);
    }
};

/**
 * For tests on programs
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
    assertEqual: function (prog, temp) {
        assert(_.isObject(prog), 'Program is not a object');
        assert.strictEqual(prog.name, temp.name);
        assert.strictEqual(prog.degree, temp.degree);
        assert.strictEqual(prog.level, temp.level);
        assert.strictEqual(prog.desc, temp.desc);
        assert.strictEqual(prog.schoolId, temp.schoolId);
        assert.strictEqual(prog.department, temp.department);
        assert.strictEqual(prog.faculty, temp.faculty);

        assert.deepEqual(prog.areas, temp.areas);
        assert.deepEqual(prog.contact, temp.contact);
    }
};

/**
 * For tests on category
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
    assertEqual: function (cat, temp) {
        assert(_.isObject(cat), 'AreaCategory is not an object');
        assert.strictEqual(cat.name, temp.name);
        assert.strictEqual(cat.desc, temp.desc);
    }
};
