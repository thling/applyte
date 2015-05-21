'use strict';

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

module.exports.school = {
    get template() {
        return {
            name: 'Purdue University',
            phone: '+1 (765) 494-4600',
            email: null,
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

module.exports.program = {
    get template() {
        return {
            name: 'Computer Science',
            degree: 'Master of Science',
            level: 'Graduate',
            schoolId: null,
            areas: [
                'Databases',
                'Distributed Systems',
                'Information Security and Assurance'
            ],
            contact: {
                fax: '+1 (765) 494-0739',
                phone: '+1 (765) 494-6010',
                email: 'grad-info@cs.purdue.edu',
                address: address
            }
        };
    }
};
