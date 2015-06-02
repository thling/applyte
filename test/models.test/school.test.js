'use strict';

let _       = require('lodash');
let assert  = require('assert');
let master  = require('../test.master');
let Program = require('../../models/program');
let School  = require('../../models/school');

require('co-mocha');

describe('School model test', function () {
    // The template for test-purpose school
    let template = master.school.template;
    let school;

    describe('School object instantiation test', function () {
        it('should create a populated School object', function *() {
            school = new School(template);
            master.school.assertEqual(school, template);
        });
    });

    describe('School object basic functionality test', function () {
        it('should return a generator with school.linksIter', function () {
            let links = school.linksIter();
            for (let link of links()) {
                assert.notStrictEqual(template.links.indexOf(link), -1);
            }
        });

        it('should remove a link, then add it back', function () {
            let newLinks = _.take(template.links, template.links.length - 1);
            let newTemp = master.school.template;
            let toRemove = _.takeRight(school.links)[0];
            school.removeLink(toRemove.name);

            newTemp.links = newLinks;
            master.school.assertEqual(school, newTemp);

            school.addLink(toRemove.name, toRemove.url);
            master.school.assertEqual(school, template);
        });
    });

    describe('School model database test', function (){
        after('cleaning up created test school', function *() {
            yield school.delete();
        });

        describe('Basic database test', function () {
            it('should save to database and return an ID', function *() {
                assert(yield school.save(), 'failed to save data: DB connection lost?');
                assert(!_.isUndefined(school.id) && !_.isNull(school.id));
            });

            it('should retrieve the inserted school properly', function *() {
                let schoolFound = yield School.findById(school.id);
                master.school.assertEqual(schoolFound, template);
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
                master.school.assertEqual(updatedSchool, templateCopy);
            });

            it('should update multiple fields', function *() {
                let temp = master.school.template;
                // To test the partial update for address object
                let tempAddress = temp.address;

                temp.name = 'Purrrrdue University';
                temp.phone = '+1 (123) 456 7890';
                temp.email = 'new@email.cc';
                temp.address = {
                    address2: 'New address 2',
                    country: 'Random country lol'
                };

                school.update(temp);
                assert(yield school.save(), 'failed to save data: DB connection lost?');

                _.assign(temp.address, _.omit(tempAddress, _.keys(temp.address)));

                let updatedSchool = yield School.findById(school.id);
                master.school.assertEqual(updatedSchool, temp);
            });
        });

        describe('Complex database test', function () {
            let program1 = new Program(master.program.template),
                program2 = new Program(master.program.template),
                program3 = new Program(master.program.template),
                program4 = new Program(master.program.template),
                program5 = new Program(master.program.template);

            let testPrograms = [program1, program2, program3, program4, program5];

            let purdue = new School(master.school.template),
                purdueCal = new School(master.school.template),
                uiuc = new School(master.school.template),
                umich = new School(master.school.template),
                bu = new School(master.school.template),
                mit = new School(master.school.template);

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

                purdueCal.update({
                    campus: 'Calumet',
                    address: {
                        city: 'Hammond'
                    }
                });

                uiuc.update({
                    name: 'University of Illinois',
                    campus: 'Urbana-Champaign',
                    address: {
                        city: 'Champaign',
                        state: 'Illinois'
                    }
                });

                umich.update({
                    name: 'University of Michigan',
                    campus: 'Ann Arbor',
                    address: {
                        city: 'Ann Arbor',
                        state: 'Michigan'
                    }
                });

                bu.update( {
                    name: 'Boston University',
                    campus: 'Boston',
                    address: {
                        city: 'Boston',
                        state: 'Massachusetts'
                    }
                });

                mit.update({
                    name: 'Massachusetts Institute of Technology',
                    campus: 'Cambridge',
                    address: {
                        city: 'Cambridge',
                        state: 'Massachusetts'
                    }
                });

                yield purdue.save();
                yield purdueCal.save();
                yield uiuc.save();
                yield umich.save();
                yield bu.save();
                yield mit.save();
            });

            after('Cleaning up programs', function *() {
                // Don't need those in database anymore, clean up now
                for (let testProg of testPrograms) {
                    yield testProg.delete();
                }

                for (let testSchool of [purdue, purdueCal, uiuc, umich, bu, mit]) {
                    yield testSchool.delete();
                }
            });

            // Might want to remove in teh future
            it('should return all schools', function *() {
                let foundSchools = yield School.getAllSchools();
                master.listEquals(
                        foundSchools,
                        [school, purdue, purdueCal, uiuc, umich, bu, mit]
                );
            });

            it('should return all programs it has', function *() {
                let programs = yield school.getAllPrograms();
                master.listEquals(programs, testPrograms);
            });

            it('should return all programs with undergraduate degree of science', function *() {
                let programs = yield school.getProgramsWith(function (prog) {
                    return prog('degree').match('.*Science').and(
                            prog('level').match('Undergraduate'));
                });

                let tests = [program2, program3];
                master.listEquals(programs, tests);
            });

            it('should be return Purdue University', function *() {
                let foundSchools = yield School.findByName('Purdue');
                master.listEquals(foundSchools, [purdue, purdueCal]);
            });

            it('should be able to search by location', function *() {
                let foundSchools = yield School.findByLocation({ state: 'Massachusetts' });
                master.listEquals(foundSchools, [bu, mit]);
            });

            describe('Pagination test', function () {
                it('should return schools from 2nd to 4th position', function *() {
                    let foundSchools = yield School.getSchoolsRange(1, 3);
                    master.listEquals(foundSchools, [mit, purdueCal, purdue]);
                });

                it('should return schools from 6nd to 4th position', function *() {
                    let foundSchools = yield School.getSchoolsRange(4, 3, true);
                    master.listEquals(foundSchools, [purdueCal, mit, bu]);
                });
            });
        });
    });
});
