'use strict';

let type = require('thinky')().type;

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
    address1: type.string(),
    address2: type.string(),
    city: type.string(),
    state: type.string(),
    postalCode: type.string(),
    country: type.string()
};

module.exports = {
    // Schools schema
    school: {
        id: type.string(),      // Primary key
        name: type.string().required(),
        campus: type.string().default(null),
        desc: type.string(),
        email: type.string().email(),
        phone: type.string(),
        logo: type.string(),
        address: address,
        links: [
            {
                name: type.string(),
                url: type.string()
            }
        ]
    },
    // Programs schema
    program: {
        id: type.string(),
        name: type.string().required(),
        degree: type.string().required(),
        level: type.string().required(),
        desc: type.string().required(),
        schoolId: type.string(),
        department: type.string().required(),
        faculty: type.string().required(),  // Also known as 'College of *' in US
        areas: [
            {
                name: type.string(),
                categories: [type.string()]
            }
        ],
        contact: {
            fax: type.string(),
            phone: type.string(),
            email: type.string().email(),
            address: address
        }
    },
    // AreaCategory schema
    area_category: {
        id: type.string(),
        name: type.string().required(),     // Primary key
        desc: type.string()
    }
};
