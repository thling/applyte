'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// Faculty schema
module.exports = {
    id: type.string(),
    name: {
        first: type.string(),
        middle: type.string(),
        last: type.string(),
        prefix: type.string()
    },
    title: type.string(),
    department: type.string(),
    bio: type.string(),
    homepage: type.string(),
    contact: {
        email: type.string().email(),
        phone: type.string(),
        office: {
            building: type.string(),
            room: type.string()
        }
    }
};
