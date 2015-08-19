'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// Schools schema
module.exports = {
    id: type.string(),      // Primary key
    name: type.string().required(),
    campus: type.string().default(null),
    desc: type.string(),
    email: type.string().email(),
    phone: type.string(),
    logo: type.string(),
    gallery: [{
        title: type.string(),
        caption: type.string(),
        location: type.string()
    }],
    address: {
        recipient: type.string(),
        address: type.string(),
        city: type.string(),
        adminDivision: type.string(),   // e.g. State, province, etc.
        postalCode: type.string(),
        country: type.string()
    },
    links: [
        {
            name: type.string(),
            url: type.string()
        }
    ]
};
