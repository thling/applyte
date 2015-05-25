'use strict';

// General address object
let address = {
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
        department: null,
        faculty: null,  // Also known as 'College of *' in US
        areas: [],      // In the form of [{name: '', categoryIds: []}]
        contact: {
            fax: null,
            phone: null,
            email: null,
            address: address
        }
    },
    // Category schema
    area_categories: {
        name: null,
        desc: null
    }
};
