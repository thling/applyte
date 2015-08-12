'use strict';

let basedir = '../';
let co      = require('co');
let fs      = require('fs');
let r       = require(basedir + 'config/thinky')().r;

const STATES_DATA_PATH = './migrations/data/united-states/states.json';
const CITIES_DATA_PATH = './migrations/data/united-states/cities.json';

const COUNTRY_NAME = 'United States';
const ABBREV = 'US';

const COUNTRY_TABLE = 'country';
const STATE_TABLE = 'adminDivision';
const CITY_TABLE = 'city';

const COUNTRY_INDEX = 'country';

exports.up = function (next) {
    co(function *() {
        // Insert new country
        yield r.table(COUNTRY_TABLE)
            .insert({
                name: COUNTRY_NAME,
                abbrev: ABBREV
            })
            .run();

        // Insert all states from file
        let states = JSON.parse(fs.readFileSync(STATES_DATA_PATH));
        for (let state of states) {
            let res = yield r.table(STATE_TABLE)
                    .insert({
                        name: state.name,
                        abbrev: state.abbrev,
                        country: COUNTRY_NAME
                    })
                    .run();

            state.id = res.generated_keys[0];
        }
    })
    .then(next)
    .catch(function (error) {
        console.log(error.message);
        next();
    });
};

exports.down = function (next) {
    co(function *() {
        // Remove country
        yield r.table('country').get(COUNTRY_NAME).delete();

        // Remove states related to with that country
        yield r.table(STATE_TABLE)
                .getAll(COUNTRY_NAME, { index: COUNTRY_INDEX })
                .delete()
                .run();
    })
    .then(next)
    .catch(function (error) {
        console.log(error.message);
        next();
    });
};
