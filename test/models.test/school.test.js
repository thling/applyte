'use strict';

let _       = require('lodash');
let assert  = require('assert');
let master  = require('../test.master');
let Program = require('../../models/program');
let r       = require('../../models/r')();
let School  = require('../../models/school');

require('co-mocha');

const TABLE = School.getTable();

describe('School model test', function () {
    // The template for test-purpose school
    let template = master.school.template;
    let school;

    /**
     * Validates the school against the template above
     *
     * @param   school  The school to validate
     * @throws  AssertionError if not valid
     */
    let validateSchool = function (school, temp) {
        assert(_.isObject(school), 'School is not an object');
        assert.strictEqual(school.name, temp.name);
        assert.strictEqual(school.desc, temp.desc);
        assert.strictEqual(school.email, temp.email);
        assert.strictEqual(school.phone, temp.phone);
        assert.strictEqual(school.logo, temp.logo);

        assert.deepEqual(school.address, temp.address);
        assert.deepEqual(school.links, temp.links);
    };

    describe('School object instantiation test', function () {
        it('should create a populated School object', function *() {
            school = new School(template);
            validateSchool(school, template);
        });
    });

    describe('School object basic functionality test', function () {
        it('should return a generator with program.areasIter', function () {
            let links = school.linksIter();
            for (let link = links.next(); !link.done; link = links.next()) {
                assert.notStrictEqual(template.links.indexOf(link.value), -1);
            }
        });

        it('should remove a link, then add it back', function () {
            let newLinks = _.take(template.links, school.links.length - 1);
            let newTemp = master.school.template;
            let toRemove = _.takeRight(school.links)[0];
            school.removeLink(toRemove.name);

            newTemp.links = newLinks;
            validateSchool(school, newTemp);

            school.addLink(toRemove.name, toRemove.url);
            validateSchool(school, template);
        });
    });

    describe('School model database test', function (){
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

        describe('Basic database test', function () {
            it('should save to database and return an ID', function *() {
                assert(yield school.save(), 'failed to save data: DB connection lost?');
                assert(!_.isUndefined(school.id) && !_.isNull(school.id));
            });

            it('should retrieve the inserted school properly', function *() {
                let schoolFound = yield School.findById(school.id);
                validateSchool(schoolFound, template);
            });

            it('should update one field', function *() {
                // Slightly modify the value
                let templateCopy = master.school.template;
                templateCopy.links.push ({
                    name: 'Registrars',
                    url: 'http://registrasurl.com'
                });

                school.addLink('Registrars', 'http://registrasurl.com');

                // Attempt to save
                assert(yield school.save(), 'failed to save data: DB connection lost?');

                // Attempt to grab the same ID, hopefully the value corresponds
                // to waht we changed
                let updatedSchool = yield School.findById(school.id);
                validateSchool(updatedSchool, templateCopy);
            });

            it('should update multiple fields', function *() {
                let templateCopy = master.school.template;
                templateCopy.name = 'Purrrrdue University';
                templateCopy.phone = '+1 (123) 456 7890';
                templateCopy.address.address2 = 'New address 2';
                templateCopy.address.country = 'Random country lol';
                templateCopy.email = 'new@email.cc';

                school.update(templateCopy);
                assert(yield school.save(), 'failed to save data: DB connection lost?');

                let updatedSchool = yield School.findById(school.id);
                validateSchool(updatedSchool, templateCopy);
            });
        });

        describe('Complex database test', function () {
            let program1 = new Program(master.program.template),
                program2 = new Program(master.program.template),
                program3 = new Program(master.program.template),
                program4 = new Program(master.program.template),
                program5 = new Program(master.program.template);

            let testPrograms = [program1, program2, program3, program4, program5];

            before('Adding multiple programs', function *() {
                program1.schoolId = school.id;

                program2.update({
                    schoolId: school.id,
                    name: 'Mechanical Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate'
                });

                program3.update({
                    schoolId: school.id,
                    name: 'Industrial Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate'
                });

                program4.update({
                    schoolId: school.id,
                    name: 'Management',
                    degree: 'Master of Business Administration'
                });

                program5.update({
                    schoolId: school.id,
                    name: 'Philosophy',
                    degree: 'Master of Arts'
                });

                yield program1.save();
                yield program2.save();
                yield program3.save();
                yield program4.save();
                yield program5.save();
            });

            after('Cleaning up programs', function *() {
                // Don't need those in database anymore, clean up now
                for (let testProg of testPrograms) {
                    yield r.table(Program.getTable())
                            .get(testProg.id)
                            .delete()
                            .run();
                }
            });

            it('should return all programs it has', function *() {
                let programs = yield school.getAllPrograms();
                master.program.listEquals(programs, testPrograms);
            });

            it('should return all programs with undergraduate degree of science', function *() {
                let programs = yield school.getProgramsWith(function (prog) {
                    return prog('degree').match('.*Science').and(
                            prog('level').match('Undergraduate'));
                });

                let tests = [program2, program3];
                master.program.listEquals(programs, tests);
            });

            it('should be able to search by name');
            it('should be able to search by location');
        });
    });
});
