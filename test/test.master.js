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
            email: null,
            phone: '+1 (765) 494-4600',
            logo: null,
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
            schoolId: null,
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
    }
};

/**
 * For tests on category
 */
module.exports.category = {
    get template() {
        return {
            name: 'Security',
            desc: 'Research of security'
        };
    }
};
