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
        describe('Basic database test', function () {
            after('cleaning up database', function *() {
                yield areaCategory.delete();
            });

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
            let database, literature, network, security, systems;
            let categories;

            before('adding more entries to database', function *() {
                database = new AreaCategory(master.areaCategory.template);
                systems = new AreaCategory(master.areaCategory.template);
                network = new AreaCategory(master.areaCategory.template);
                security = new AreaCategory(master.areaCategory.template);
                literature = new AreaCategory(master.areaCategory.template);

                database.name = 'Database';
                systems.name = 'Systems';
                network.name = 'Network';
                security.name = 'Security';
                literature.name = 'Literature';

                yield database.save();
                yield systems.save();
                yield network.save();
                yield security.save();
                yield literature.save();

                categories = [database, literature, network, security, systems];
            });

            after('cleaning up database', function *() {
                for (let cat of categories) {
                    yield cat.delete();
                }
            });

            it('should be able to search by name', function *() {
                let foundCategory = yield AreaCategory.findByName('Systems');
                master.areaCategory.assertEqual(foundCategory, systems);
            });

            it('should list all area categories', function *() {
                let foundCats = yield AreaCategory.getAllAreaCategories();
                master.listEquals(foundCats, categories);
            });

            describe('Pagination test', function () {
                it('should list 2nd to 4th categories (LIT, NETWK, SECRTY)', function *() {
                    let foundCats = yield AreaCategory.getAreaCategoriesRange(1, 3);
                    master.listEquals(foundCats, [literature, network, security]);
                });

                it('should list 3rd to 1st categories (NETWK, LIT, DB)', function *() {
                    let foundCats = yield AreaCategory.getAreaCategoriesRange(2, 3, true);
                    master.listEquals(foundCats, [network, literature, database]);
                });
            });
        });
    });
});
