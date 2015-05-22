'use strict';

var assert = require('assert');

/**
 * This file is strictly used for utilities related to testing.
 */

 var address = {
     address1: '610 Purdue Mall',
     address2: null,
     city: 'West Lafayette',
     state: 'Indiana',
     postalCode: '47907',
     country: 'United States of America'
 };

/**
 * For tests on school
 */
module.exports.school = {
    get template() {
        return {
            name: 'Purdue University',
            desc: 'Better than IU in every aspect',
            email: null,
            phone: '+1 (765) 494-4600',
            logo: null,
            address: address,
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
            faculty: 'College of Science',
            schoolId: null,
            areas: [{
                    name: 'Databases',
                    categoryId: []
                },
                {
                    name: 'Distributed System',
                    categoryId: []
                },
                {
                    name: 'Information Security and Assurance',
                    categoryId: []
                }
            ],
            contact: {
                fax: '+1 (765) 494-0739',
                phone: '+1 (765) 494-6010',
                email: 'grad-info@cs.purdue.edu',
                address: address
            }
        };
    },

    /**
     * Verifies that two sets (list) of programs contain the same data
     *
     * @param   progs   The first list to test
     * @param   tests   The second list to test
     * @throws  Assertion error if two lists differ
     */
    listEquals: function (progs, tests) {
        assert.strictEqual(progs.length, tests.length);

        for (let prog of progs) {
            for (let testProg of tests) {
                if (testProg.id === prog.id) {
                    assert.deepEqual(testProg, prog);
                    break;
                }
            }
        }
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
