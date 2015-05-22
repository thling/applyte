'use strict';

var assert  = require('assert');
var _       = require('lodash');
var master  = require('./test.master');
var Program = require('../models/program');
var r       = require('../models/r')();
var School  = require('../models/school');

require('co-mocha');

const TABLE = Program.getTable();

describe('Program model tests', function () {
    var template = master.program.template;
    var school, program;

    before('adding dummy school', function *() {
        school = new School(master.school.template);

        try  {
            yield school.save();
            template.schoolId = school.id;
        } catch (error) {
            console.error(error);
        }
    });

    after('cleaning database', function *() {
        try {
            yield r.table('schools')
                    .get(school.id)
                    .delete()
                    .run();
        } catch (error) {
            console.error(error);
        }
    });

    /**
     * Validates the program against the template above
     *
     * @param   prog    The prog to validate
     * @throws  AssertionError if not valid
     */
    var validateProgram = function (prog, temp) {
        assert(_.isObject(prog), 'Program is not a object');
        assert.strictEqual(prog.name, temp.name);
        assert.strictEqual(prog.degree, temp.degree);
        assert.strictEqual(prog.level, temp.level);
        assert.strictEqual(prog.desc, temp.desc);
        assert.strictEqual(prog.schoolId, temp.schoolId);
        assert.deepEqual(prog.areas, temp.areas);
        assert.deepEqual(prog.contact, temp.contact);
    };

    describe('Program object instantiation test', function () {
        it('Should create a newly populated program object', function () {
            program = new Program(template);
            validateProgram(program, template);
        });
    });

    describe('Program object basic functionality test', function () {
        it('should return a generator with program.areasIter', function () {
            let areas = program.areasIter();
            for (let area = areas.next(), i = 0; !area.done; area = areas.next(), i++) {
                assert.deepEqual(template.areas[i], area.value);
            }
        });
    });

    describe('Program model database test', function () {
        describe('Basic database test', function () {
            before('saving program', function *() {
                assert(yield program.save(), 'DB connection error?');
            });

            after('cleaning database', function *() {
                try {
                    yield r.table(TABLE)
                            .get(program.id)
                            .delete()
                            .run();
                } catch (error) {
                    console.error(error);
                }
            });

            it('should have an ID assigned to it', function () {
                assert(program.id, 'Cannot find ID');
            });

            it('should save properly to database', function *() {
                var foundProgram = yield Program.findById(program.id);
                validateProgram(foundProgram, template);
            });

            it('should be able to update one field', function *() {
                var newTemp = master.program.template;
                newTemp.schoolId = template.schoolId;
                newTemp.degree = 'Master of Business Administration';

                program.degree = 'Master of Business Administration';
                yield program.save();

                var foundProgram = yield Program.findById(program.id);
                validateProgram(foundProgram, newTemp);
            });

            it('should be able to bulk update muliple fields', function *() {
                var newTemp = master.program.template;
                newTemp.schoolId = template.schoolId;
                newTemp.degree = 'Master of Business Administration';
                newTemp.name = 'Management';
                newTemp.contact.email = 'mba@purdue.edu';
                newTemp.areas = [
                    'Information Technology Management',
                    'Product Management',
                    'Supply Chain Management'
                ];

                program.update(newTemp);
                yield program.save();

                var foundProgram = yield Program.findById(program.id);
                validateProgram(foundProgram, newTemp);
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
                program2.update({
                    name: 'Mechanical Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate'
                });

                program3.update({
                    name: 'Industrial Engineering',
                    degree: 'Bachelor of Science',
                    level: 'Undergraduate'
                });

                program4.update({
                    name: 'Management',
                    degree: 'Master of Business Administration'
                });

                program5.update({
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

            it('should return all graduate programs', function *() {
                this.timeout(60000);
                let programs = yield Program.findByLevel('Graduate');
                let gradPrograms = [program1, program4, program5];
                master.program.listEquals(programs, gradPrograms);
            });
        });
    });
});
