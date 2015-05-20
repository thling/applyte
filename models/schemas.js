'use strict';

// General address object
var address = {
    'address1': null,
    'address2': null,
    'city': null,
    'state': null,
    'postalCode': null,
    'country': null,
};

module.exports = {
    // Schools schema
    'schools': {
        'name': null,
        'address': address,
        'email': null,
        'phone': null,
        'links': {}
    },
    // Programs schema
    'programs': {
        'name': null,
        'degree': null,
        'level': ['Undergraduate', 'Graduate'],
        'areas': [],
        'schoolId': null,
        'admissionsOffice': {
            'fax': null,
            'phone': null,
            'email': null,
            'address': address
        }
    }
};
