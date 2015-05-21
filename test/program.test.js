'use strict';

var assert  = require('assert');
var _       = require('lodash');
var master  = require('./test.master');
var Program = require('../models/program');
var r       = require('../models/r')();
var School  = require('../models/school');

require('co-mocha');

const TABLE = 'programs';

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

    describe('Program model database test', function () {
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
            console.log(foundProgram);

        });
    });
});
