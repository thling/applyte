'use strict';
var _      = require('lodash');
var assert = require('assert');
var master = require('./test.master');
var r      = require('../models/r')();
var School = require('../models/school');

require('co-mocha');

const TABLE = 'schools';

describe('School model test', function () {
    // The template for test-purpose school
    var template = master.school.template;
    var school = new School(template);

    /**
     * Validates the school against the template above
     *
     * @param   school  The school to validate
     * @throws  AssertionError if not valid
     */
    var validateSchool = function (school, temp) {
        assert(_.isObject(school), 'School is not an object');
        assert.strictEqual(school.name, temp.name);
        assert.strictEqual(school.phone, temp.phone);
        assert.strictEqual(school.email, temp.email);

        assert.deepEqual(school.address, temp.address);
        assert.deepEqual(school.links, temp.links);
        assert.deepEqual(school.links, temp.links);
    };

    describe('School object instantiation test', function () {
        it('should create a populated School object', function *() {
            validateSchool(school, template);
        });
    });

    describe('School model database test', function (){
        before('setting up database', function *() {
            assert(yield school.save(), 'failed to save data: DB connection lost?');
        });

        after('cleaning up created test school', function *() {
            try {
                yield r.table(TABLE)
                        .get(school.id)
                        .delete()
                        .run();
            } catch (error) {
                console.error(error);
            }
        });

        it('should save to database and return an ID', function *() {
            assert(school.id);
        });

        it('should populate school properly', function *() {
            var schoolFound = yield School.findById(school.id);
            validateSchool(schoolFound, template);
        });

        it('should update one field', function *() {
            // Slightly modify the value
            var templateCopy = master.school.template;
            templateCopy.links.push ({
                name: 'Registrars',
                url: 'http://registrasurl.com'
            });

            school.addLink('Registrars', 'http://registrasurl.com');

            // Attempt to save
            assert(yield school.save(), 'failed to save data: DB connection lost?');

            // Attempt to grab the same ID, hopefully the value corresponds
            // to waht we changed
            var updatedSchool = yield School.findById(school.id);
            validateSchool(updatedSchool, templateCopy);
        });

        it('should update multiple fields', function *() {
            var templateCopy = master.school.template;
            templateCopy.name = 'Purrrrdue University';
            templateCopy.phone = '+1 (123) 456 7890';
            templateCopy.address.address2 = 'New address 2';
            templateCopy.address.country = 'Random country lol';
            templateCopy.email = 'new@email.cc';

            school.update(templateCopy);
            assert(yield school.save(), 'failed to save data: DB connection lost?');

            var updatedSchool = yield School.findById(school.id);
            validateSchool(updatedSchool, templateCopy);
        });
    });
});
