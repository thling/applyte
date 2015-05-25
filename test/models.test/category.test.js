'use strict';

let _        = require('lodash');
let assert   = require('assert');
let master   = require('../test.master');
let Category = require('../../models/category');
let r        = require('../../models/r')();

require('co-mocha');

const TABLE = Category.getTable();

describe('Category model test', function () {
    let template = master.category.template;
    let category;

    let validateCategory = function (cat, temp) {
        assert(_.isObject(cat), 'School is not an object');
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
            try {
                yield r.table(TABLE)
                        .get(category.id)
                        .delete()
                        .run();
            } catch (error) {
                console.error(error);
            }
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
            it('should be able to search by name');
            it('should be able to search by name');
        });
    });
});
