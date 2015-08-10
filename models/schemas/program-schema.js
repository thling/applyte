'use strict';

let thinky = require(basedir + 'config/thinky')();
let type   = thinky.type;

// Programs schema
module.exports = {
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
            desc: type.string(),
            faculties: [ type.string() ]
        }
    ],
    ranking: {
        source: type.string(),
        rank: type.number()
    },
    deadlines: [{
        semester: type.string(),
        type: type.string(),    // Conditions, e.g. for students looking for funding
        deadline: type.date()
    }],
    links: [{
        name: type.string(),
        url: type.string()
    }],
    financials: {
        tuition: type.number(),
        fundings: [{
            type: type.string(),    // e.g. RA, TA
            desc: type.string(),
            amount: type.number()
        }],
        cost: [{
            type: type.string(),    // e.g. average dinner, coffee, movie ticket
            desc: type.string(),
            amount: type.number()
        }]
    },
    reqs: {
        sop: type.string(),
        fee: type.number(),
        toefl: {
            required: type.boolean(),
            reading: type.number(),
            listening: type.number(),
            speaking: type.number(),
            writing: type.number(),
            total: type.number()
        },
        gre: {
            required: type.boolean(),
            verbal: type.number(),
            verbalP: type.number(),
            quant: type.number(),
            quantP: type.number(),
            writing: type.number(),
            writingP: type.number()
        },
        greSubject: {
            required: type.boolean(),
            type: type.string(),
            score: type.number(),
            scoreP: type.number()
        },
        transcripts: [{
            copies: type.number(),
            type: type.string(),    // e.g. undergrad, grad
            delivery: type.string().enum('fax', 'mail', 'electronic'),
            address: type.object().schema({     // Exist only if delivery is 'mail'
                recipient: type.string(),
                address: type.string(),
                city: type.string(),
                adminDivision: type.string(),
                postalCode: type.string(),
                country: type.string()
            }).default(null),
            fax: type.string().default(null)  // Exists only if delivery is 'fax'
        }],
        recommendation: {
            copies: type.number(),
            contents: type.string(),    // What's required?
            delivery: type.string().enum('fax', 'mail', 'electronic'),
            address: type.object().schema({     // Exist only if delivery is 'mail'
                recipient: type.string(),
                address: type.string(),
                city: type.string(),
                adminDivision: type.string(),
                postalCode: type.string(),
                country: type.string()
            }).default(null),
            fax: type.string().default(null)  // Exists only if delivery is 'fax'
        }
    },
    contact: {
        fax: type.string(),
        phone: type.string(),
        email: type.string().email(),
        address: {
            recipient: type.string(),
            address: type.string(),
            city: type.string(),
            adminDivision: type.string(),   // e.g. State, province, etc.
            postalCode: type.string(),
            country: type.string()
        }
    },
    tags: [ type.string() ]
};
