'use strict';

let assert   = require('assert');
let _        = require('lodash');
let Category = require('../../models/category');
let master   = require('../test.master');
let Program  = require('../../models/program');
let School   = require('../../models/school');

require('co-mocha');

describe('Program model tests', function () {
    let template = master.program.template;
    let school, program;

    before('adding dummy school', function *() {
        school = new School(master.school.template);
        yield school.save();
        template.schoolId = school.id;
    });

    after('cleaning database', function *() {
        yield school.delete();
    });

    describe('Program object instantiation test', function () {
        it('Should create a newly populated program object', function () {
            program = new Program(template);
            master.program.assertEqual(program, template);
        });
    });

    describe('Program object basic functionality test', function () {
        it('should return a generator with program.areasIter', function () {
            let i = 0, areas = program.areasIter();
            for (let area of areas()) {
                assert.deepEqual(template.areas[i++], area);
            }

        });

        it('should remove an area then add it back', function () {
            let newTemp = master.program.template;
            let toRemove = _.takeRight(newTemp.areas)[0];
            newTemp.areas = _.take(newTemp.areas, newTemp.areas.length - 1);
            newTemp.schoolId = template.schoolId;

            program.removeArea(toRemove.name);
            master.program.assertEqual(program, newTemp);

            program.addArea(toRemove.name, toRemove.categories);
            master.program.assertEqual(program, template);
        });
    });

    describe('Program model database test', function () {
        describe('Basic database test', function () {
            after('cleaning database', function *() {
                yield program.delete();
            });

            it('should save to database and have an ID assigned to it', function *() {
                assert(yield program.save(), 'failed to save data: DB connection lost?');
                assert(!_.isUndefined(program.id) && !_.isNull(program.id));
            });

            it('should retrieve the inserted program', function *() {
                let foundProgram = yield Program.findById(program.id);
                master.program.assertEqual(foundProgram, template);
            });

            it('should be able to update one field', function *() {
                let newTemp = master.program.template;
                newTemp.schoolId = template.schoolId;
                newTemp.degree = 'Master of Business Administration';

                program.degree = 'Master of Business Administration';
                yield program.save();

                let foundProgram = yield Program.findById(program.id);
                master.program.assertEqual(foundProgram, newTemp);
            });

            it('should be able to bulk update muliple fields', function *() {
                let newTemp = master.program.template;
                newTemp.schoolId = template.schoolId;
                newTemp.degree = 'Master of Business Administration';
                newTemp.name = 'Management';
                newTemp.contact.email = 'mba@purdue.edu';
                newTemp.areas = [
                    { name: 'Information Technology Management', categories: [] },
                    { name: 'Product Management', categories: [] },
                    { name: 'Supply Chain Management', categories: [] }
                ];

                program.update(newTemp);
                yield program.save();

                let foundProgram = yield Program.findById(program.id);
                master.program.assertEqual(foundProgram, newTemp);
            });
        });

        describe('Complex database test', function () {
            let compsci = new Program(master.program.template),
                mecheng = new Program(master.program.template),
                indseng = new Program(master.program.template),
                management = new Program(master.program.template),
                philosophy = new Program(master.program.template);

            let security = new Category(master.category.template),
                database = new Category(master.category.template),
                systems = new Category(master.category.template);

            let testPrograms = [compsci, mecheng, indseng, management, philosophy];

            before('Adding multiple programs', function *() {
                security.name = 'Security';
                database.name = 'Database';
                systems.name = 'Systems';

                yield security.save();
                yield database.save();
                yield systems.save();

                mecheng.update({
                    name: 'Mechanical Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate'
                });

                indseng.update({
                    name: 'Industrial Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate'
                });

                indseng.removeArea('Databases');
                indseng.removeArea('Information Security and Assurance');

                management.update({
                    name: 'Management',
                    degree: 'Master of Business Administration',
                    areas: [
                        {
                            name: 'Database Security',
                            categories: [security.name, systems.name, database.name]
                        }
                    ]
                });

                philosophy.update({
                    name: 'Philosophy',
                    degree: 'Master of Arts'
                });

                philosophy.removeArea('Information Security and Assurance');

                yield compsci.save();
                yield mecheng.save();
                yield indseng.save();
                yield management.save();
                yield philosophy.save();
            });

            after('Cleaning up programs', function *() {
                // Don't need those in database anymore, clean up now
                for (let testProg of testPrograms) {
                    yield testProg.delete();
                }

                for (let cat of [security, systems, database]) {
                    yield cat.delete();
                }
            });

            // Might want to delete in the future
            it('should return all programs', function *() {
                let foundPrograms = yield Program.getAllPrograms();
                master.listEquals(
                        foundPrograms,
                        [compsci, mecheng, indseng, management, philosophy]
                );
            });

            it('should return all graduate programs', function *() {
                let programs = yield Program.findByLevel('Graduate');
                master.listEquals(programs, [compsci, management, philosophy]);
            });

            it('should return Industrial Engineering program', function *() {
                let foundPrograms = yield Program.findByName('Industrial Engineering');
                master.listEquals(foundPrograms, [indseng]);
            });

            it('should return any program with name "Engineering"', function *() {
                let foundPrograms = yield Program.findByName('Engineering');
                master.listEquals(foundPrograms, [mecheng, indseng]);
            });

            it('should be able to search by area name ("Security")', function *() {
                let foundPrograms = yield Program.findByAreaName('Security');
                master.listEquals(foundPrograms, [compsci, mecheng, management]);
            });

            it('should be able to search by single category ("Database")', function *() {
                let foundPrograms = yield Program.findByAreaCategories('Database');
                master.listEquals(foundPrograms, [compsci, mecheng, management, philosophy]);
            });

            it('should be able to search by categories ("Database" and "Security")', function *() {
                let foundPrograms = yield Program.findByAreaCategories(['Database', 'Security']);
                master.listEquals(foundPrograms, [management]);
            });

            describe('Pagination test', function() {
                it('should return programs from 3rd to 5th position (MGMT, ME, PHIL)', function *() {
                    let foundPrograms = yield Program.getProgramsRange(2, 3);
                    master.listEquals(foundPrograms, [management, mecheng, philosophy]);
                });

                it('should return programs from 4th to 2nd position (ME, MGMT, IE)', function *() {
                    let foundPrograms = yield Program.getProgramsRange(1, 3, true);
                    master.listEquals(foundPrograms, [mecheng, management, indseng]);
                });
            });
        });
    });
});
