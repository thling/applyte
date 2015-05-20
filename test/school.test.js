'use strict';
var _       = require('lodash');
var assert  = require('assert');
var r       = require('../models/r')();
var schemas = require('../models/schemas');
var School  = require('../models/school');

require('co-mocha');

const TABLE = 'schools';

describe('School model test', function () {
    // The template for test-purpose school
    var template = schemas.schools;
    template.name = 'Purdue University';
    template.address.address1 = '610 Purdue Mall';
    template.address.address2 = null;
    template.address.city = 'West Lafayette';
    template.address.state = 'Indiana';
    template.address.postalCode = '47907';
    template.address.country = 'United States of America';
    template.phone = '+1 (765) 494 4600';
    template.email = null;
    template.links = {
        'Official Website': 'http://www.purdue.edu',
        'Admissions': 'http://www.purdue.edu/admissions'
    };

    /**
     * Validates the school against the template above
     *
     * @param   school  The school to validate
     * @throws  AssertionError if not valid
     */
    var validateSchool = function (school, temp) {
        var valid = true;

        valid = (school)? valid : false;
        valid = (school.getName() === temp.name)? valid : false;
        valid = (school.getPhone() === temp.phone)? valid : false;
        valid = (school.getEmail() === temp.email)? valid : false;

        var address = school.getAddress();
        valid = (address.address1 === temp.address.address1)? valid : false;
        valid = (address.address2 === temp.address.address2)? valid : false;
        valid = (address.city === temp.address.city)? valid : false;
        valid = (address.state === temp.address.state)? valid : false;
        valid = (address.postalCode === temp.address.postalCode)? valid : false;
        valid = (address.country === temp.address.country)? valid : false;

        var links = school.getLinks();
        _.forIn(temp.links, function (value, key) {
            valid = (_.has(links, key))? valid : false;
            valid = (links[key] === value)? valid : false;
        });

        return valid;
    };

    describe('School object instantiation tests', function () {
        var school = new School(template);
        it('Should create a School object', function *() {
            assert(_.isObject(school));
        });

        it ('Should properly assign the properties to a School object', function *() {
            assert(validateSchool(school, template));
        });
    });

    describe('School model database tests', function (){
        var school;

        before('Setting up database', function *() {
            school = new School(template);
            assert(yield school.save(), 'Failed to save data: DB connection lost?');
        });

        after('Cleaning up created test school', function *() {
            try {
                yield r.table(TABLE)
                        .get(school.getId())
                        .delete()
                        .run();
            } catch (error) {
                console.error(error);
            }
        });

        it('Should save to database and return an ID', function *() {
            assert(school.getId());
        });

        it('Should populate school properly', function *() {
            var schoolFound = yield School.findById(school.getId());
            assert(validateSchool(schoolFound, template));
        });

        it('Should update one field', function *() {
            // Slightly modify the value
            var templateCopy = template;
            templateCopy.links.Registrars = 'http://registrasurl.com';
            school.addLink('Registrars', 'http://registrasurl.com');

            // Attempt to save
            assert(yield school.save(), 'Failed to save data: DB connection lost?');

            // Attempt to grab the same ID, hopefully the value corresponds
            // to waht we changed
            var updatedSchool = yield School.findById(school.getId());
            assert(validateSchool(updatedSchool, templateCopy));
        });

        it('Should update multiple fields', function *() {
            var templateCopy = template;
            templateCopy.name = 'Purrrrdue University';
            templateCopy.phone = '+1 (123) 456 7890';
            templateCopy.address.address2 = 'New address 2';
            templateCopy.address.country = 'Random country lol';
            templateCopy.email = 'new@email.cc';

            school.update(templateCopy);
            assert(yield school.save(), 'Failed to save data: DB connection lost?');

            var updatedSchool = yield School.findById(school.getId());
            assert(validateSchool(updatedSchool, templateCopy));
        });
    });
});
