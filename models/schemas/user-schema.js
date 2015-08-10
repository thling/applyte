'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// User schema
module.exports = {
    id: type.string(),  // Not set by user, this is ID for internal use
    password: type.string().required(),
    name: {
        first: type.string(),
        middle: type.string(),
        last: type.string(),
        preferred: type.string()
    },
    birthday: {
        year: type.number().min(1900).max(2015),
        month: type.number().min(1).max(12),
        day: type.number().min(1).max(31)
    },
    contact: {
        email: type.string().email(),
        phone: type.string(),
        address: {
            address: type.string(),
            city: type.string(),
            adminDivision: type.string(),   // e.g. State, province, etc.
            postalCode: type.string(),
            country: type.string()
        }
    },
    accessRights: type.string().enum('user', 'admin', 'developer'),
    verified: type.boolean(),
    created: type.date(),
    modified: type.date()
};
