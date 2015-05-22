'use strict';

// General address object
var address = {
    address1: null,
    address2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
};

module.exports = {
    // Schools schema
    schools: {
        name: null,
        desc: null,
        email: null,
        phone: null,
        logo: null,
        address: address,
        links: []       // In the form of [{name: '', url: ''}]
    },
    // Programs schema
    programs: {
        name: null,
        degree: null,
        level: null,
        desc: null,
        schoolId: null,
        areas: [],      // In the form of [{name: '', categoryId: ''}]
        contact: {
            fax: null,
            phone: null,
            email: null,
            address: address
        }
    },
    // Category schema
    category: {
        name: null,
        desc: null
    }
};
