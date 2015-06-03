'use strict';

let _            = require('lodash');
let assert       = require('assert');
let AreaCategory = require('../../models/area-category');
let master       = require('../test-master');

require('co-mocha');

describe('AreaCategory model test', function () {
    let template = master.areaCategory.template;
    let areaCategory;

    describe('AreaCategory object instantiation test', function () {
        it('should create a newly populated AreaCategory object', function () {
            areaCategory = new AreaCategory(template);
            master.areaCategory.assertEqual(areaCategory, template);
        });
    });

    describe('AreaCategory database test', function () {
        after('cleaning up database', function *() {
            yield areaCategory.delete();
        });

        describe('Basic database test', function () {
            it('should be save to database and have an ID assigned to it', function *() {
                assert(yield areaCategory.save(), 'failed to save data: DB connection lost?');
                assert(!_.isUndefined(areaCategory.id) && !_.isNull(areaCategory.id));
            });

            it('should retrieve the inserted AreaCategory', function *() {
                let newCat = yield AreaCategory.findById(areaCategory.id);
                master.areaCategory.assertEqual(newCat, template);
            });

            it('should be able to update one field', function *() {
                let newTemp = master.areaCategory.template;
                newTemp.name = 'Database Systems';
                newTemp.desc = 'The research of persistant data storage';

                areaCategory.update(newTemp);
                yield areaCategory.save();

                let newCat = yield AreaCategory.findById(areaCategory.id);
                master.areaCategory.assertEqual(newCat, newTemp);
            });
        });

        describe('Complex database test', function () {
            let database, systems, network;

            before('adding more entries to database', function *() {
                database = new AreaCategory(master.areaCategory.template);
                database.name = 'Database';

                systems = new AreaCategory(master.areaCategory.template);
                systems.name = 'Systems';

                network = new AreaCategory(master.areaCategory.template);
                network.name = 'Network';

                yield database.save();
                yield systems.save();
                yield network.save();
            });

            after('cleaning up database', function *() {
                for (let cat of [database, systems, network]) {
                    yield cat.delete();
                }
            });

            it('should be able to search by name', function *() {
                let foundCategory = yield AreaCategory.findByName('Systems');
                master.areaCategory.assertEqual(foundCategory, systems);
            });
        });
    });
});
