'use strict';

let _            = require('lodash');
let assert       = require('assert');
let master       = require('../test-master');
let Program      = require('../../models/program');
let School       = require('../../models/school');

require('co-mocha');

describe('Program model tests', function () {
    let template = master.program.template;
    let program, school;

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
            program = new Program(master.program.template);
            program.schoolId = template.schoolId;
            master.program.assertEqual(program, template);
        });
    });

    describe('Program object basic functionality test', function () {
        it('should return a generator with program.areasIter', function () {
            let areas = program.areasIter(), i = 0;
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

            program.addArea(toRemove.name, toRemove.desc);
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
                    { name: 'Information Technology Management', desc: 'This is test update' },
                    { name: 'Product Management', desc: 'This is test update' },
                    { name: 'Supply Chain Management', desc: 'This is test update' }
                ];

                program.update(newTemp);
                yield program.save();

                let foundProgram = yield Program.findById(program.id);
                master.program.assertEqual(foundProgram, newTemp);
            });
        });

        describe('Complex database test', function () {
            let mit, purdueWL, umich;

            let compsci = new Program(master.program.template),
                indseng = new Program(master.program.template),
                management = new Program(master.program.template),
                mecheng = new Program(master.program.template),
                philosophy = new Program(master.program.template);

            let testPrograms = [compsci, mecheng, indseng, management, philosophy];

            before('Adding multiple programs', function *() {
                // Setup schools
                purdueWL = new School(master.school.template);
                umich = new School(master.school.template);
                mit = new School(master.school.template);

                umich.update({
                    name: 'University of Michigan',
                    campus: 'Ann Arbor',
                    address: {
                        city: 'Ann Arbor',
                        state: 'Michigan'
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

                yield purdueWL.save();
                yield umich.save();
                yield mit.save();

                // Setup programs
                compsci.schoolId = purdueWL.id;

                mecheng.update({
                    name: 'Mechanical Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate',
                    schoolId: purdueWL.id
                });

                indseng.update({
                    name: 'Industrial Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate',
                    schoolId: purdueWL.id
                });

                indseng.removeArea('Databases');
                indseng.removeArea('Information Security and Assurance');

                management.update({
                    name: 'Management',
                    degree: 'Master of Business Administration',
                    areas: [
                        {
                            name: 'Database Security',
                            desc: 'This is database security'
                            // categories: [security.name, systems.name, database.name]
                        }
                    ],
                    schoolId: umich.id
                });

                philosophy.update({
                    name: 'Philosophy',
                    degree: 'Master of Arts',
                    schoolId: umich.id
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

                for (let school of [purdueWL, umich, mit]) {
                    yield school.delete();
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

            it('should return all programs with its school', function *() {
                let tempCompsci = _.omit(_.cloneDeep(compsci), 'schoolId');
                let tempMecheng = _.omit(_.cloneDeep(mecheng), 'schoolId');
                let tempIndseng = _.omit(_.cloneDeep(indseng), 'schoolId');
                let tempManagement = _.omit(_.cloneDeep(management), 'schoolId');
                let tempPhilosophy = _.omit(_.cloneDeep(philosophy), 'schoolId');

                tempCompsci.school = purdueWL;
                tempMecheng.school = purdueWL;
                tempIndseng.school = purdueWL;
                tempManagement.school = umich;
                tempPhilosophy.school = umich;

                let foundPrograms = yield Program.getAllProgramsWithSchool();

                master.listEquals(
                        foundPrograms,
                        [
                            tempCompsci,
                            tempMecheng,
                            tempIndseng,
                            tempManagement,
                            tempPhilosophy
                        ]
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

            describe('Pagination test', function () {
                it('should return programs from 3rd to 5th position (MGMT, ME, PHIL)', function *() {
                    let foundPrograms = yield Program.getProgramsByRange(2, 3);
                    master.listEquals(foundPrograms, [management, mecheng, philosophy]);
                });

                it('should return programs from 4th to 2nd position (ME, MGMT, IE)', function *() {
                    let foundPrograms = yield Program.getProgramsByRange(1, 3, true);
                    master.listEquals(foundPrograms, [mecheng, management, indseng]);
                });
            });
        });
    });
});
