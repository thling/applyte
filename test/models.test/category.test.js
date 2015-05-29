'use strict';

let _        = require('lodash');
let assert   = require('assert');
let master   = require('../test.master');
let Category = require('../../models/category');

require('co-mocha');

describe('Category model test', function () {
    let template = master.category.template;
    let category;

    let validateCategory = function (cat, temp) {
        assert(_.isObject(cat), 'Category is not an object');
        assert.strictEqual(cat.name, temp.name);
        assert.strictEqual(cat.desc, temp.desc);
    };

    describe('Category object instantiation test', function () {
        it('should create a newly populated category object', function () {
            category = new Category(template);
            validateCategory(category, template);
        });
    });

    describe('Category database test', function () {
        after('cleaning up database', function *() {
            yield category.delete();
        });

        describe('Basic database test', function () {
            it('should be save to database and have an ID assigned to it', function *() {
                assert(yield category.save(), 'failed to save data: DB connection lost?');
                assert(!_.isUndefined(category.id) && !_.isNull(category.id));
            });

            it('should retrieve the inserted category', function *() {
                let newCat = yield Category.findById(category.id);
                validateCategory(newCat, template);
            });

            it('should be able to update one field', function *() {
                let newTemp = master.category.template;
                newTemp.name = 'Database Systems';
                newTemp.desc = 'The research of persistant data storage';

                category.update(newTemp);
                yield category.save();

                let newCat = yield Category.findById(category.id);
                validateCategory(newCat, newTemp);
            });
        });

        describe('Complex database test', function () {
            let database, systems, network;

            before('adding more entries to database', function *() {
                database = new Category(master.category.template);
                database.name = 'Database';

                systems = new Category(master.category.template);
                systems.name = 'Systems';

                network = new Category(master.category.template);
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
                let foundCategory = yield Category.findByName('Systems');
                validateCategory(foundCategory, systems);
            });
        });
    });
});
