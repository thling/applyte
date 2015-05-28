'use strict';

/**
 * This file is used as a barebone for each table. The reason to
 * have this data in a schema-less database system (RethinkDB) is
 * to ensure that we don't insert garbage data that we don't need
 * into the db.
 *
 * Since RethinkDB is schema-less, if we don't constraint the data
 * inserted, there can be malformed information and even those
 * that threaten the security of the service.
 *
 * When creating new model, before each save, make sure to use
 * lodash's pick function to filter out only the data listed
 * in the schema (i.e. the data we want).
 */

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
        campus: null,
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
        areas: [],      // In the form of [{name: '', categories: []}]
        contact: {
            fax: null,
            phone: null,
            email: null,
            address: address
        }
    },
    // Category schema
    area_categories: {
        name: null,     // Primary key
        desc: null
    }
};
