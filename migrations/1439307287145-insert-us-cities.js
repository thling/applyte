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
const SUBDIVISION_INDEX = 'subdivision';

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

        // Insert all cities from file
        let stateCities = JSON.parse(fs.readFileSync(CITIES_DATA_PATH));
        for (let state in stateCities) {
            let foundStates = yield r.table(STATE_TABLE)
                    .getAll([state, COUNTRY_NAME], { index: SUBDIVISION_INDEX })
                    .run();

            // The state and country index together should make an
            // admin division unique
            if (foundStates.length !== 1) {
                // On error, we just notify which admin division went wrong
                // and continue with other admin division
                console.error(
                        foundStates.length + ' admin divisions found for \''
                        + state + ', ' + COUNTRY_NAME + '\', '
                        + ' expected 1'
                );

                console.log(
                        'The admin division \''
                        + state + ', ' + COUNTRY_NAME + '\' '
                        + 'was skipped'
                );

                continue;
            }

            state = foundStates[0];
            let cities = stateCities[state.name];
            for (let city of cities) {
                let lat = parseFloat(city.lat);
                let long = parseFloat(city.long);
                let inserObject = {
                    name: city.name,
                    adminDivision: state.name,
                    adminDivisionId: state.id,
                    country: COUNTRY_NAME
                };

                // Make sure the coordinates are valid;
                // otherwise, ignore coords but still insert the city
                if (!isNaN(lat) && !isNaN(long)) {
                    inserObject.coordinates = r.point(long, lat);
                }

                yield r.table(CITY_TABLE).insert(inserObject).run();
            }
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
        yield r.table(COUNTRY_TABLE).get(COUNTRY_NAME).delete();

        // Remove states related to with that country
        yield r.table(STATE_TABLE)
                .getAll(COUNTRY_NAME, { index: COUNTRY_INDEX })
                .delete()
                .run();

        // Remove cities related to that country
        yield r.table(CITY_TABLE)
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
