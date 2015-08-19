'use strict';

let basedir = '../../';
let master  = require(basedir + 'tests/test-master');
let Faculty = require(basedir + 'models/faculty');

require('chai').should();
require('co-mocha');

describe('Faculty model test', function () {
    describe('CRUD tests', function () {
        let faculty, faculty2;

        after('clean up database', function *() {
            yield faculty.delete();
            yield faculty2.delete();
        });

        it('should create faculty and save without problem', function *() {
            faculty = new Faculty(master.faculty.template);
            yield faculty.save();
            faculty.should.contain.key('id');
        });

        it('should create an empty middle name if middle name was not supplied on creation',
            function *() {
                faculty.should.have.deep.property('name.middle', '');
            }
        );

        it('should be able to find by faculty id with \'findById\' function', function *() {
            let foundFaculty = yield Faculty.findById(faculty.id);
            master.faculty.assertEqual(foundFaculty, faculty);
        });

        it('should work with fullname index', function *() {
            faculty2 = new Faculty(master.faculty.template);
            yield faculty2.save();
            faculty2.should.contain.key('id');

            faculty2.name = {
                first: 'Sammy',
                middle: 'Crazy',
                last: 'Beast'
            };

            yield faculty2.save();
            let foundFaculties = yield Faculty.findByFullname(
                    'Sammy',
                    'Crazy',
                    'Beast'
            );

            master.listEquals(foundFaculties, [faculty2]);
        });

        it('should ignore finding middle name if only two parameters are '
                + 'given to `findByFullname` function', function *() {
            let foundFaculties = yield Faculty.findByFullname('Sammy', 'Beast');
            master.listEquals(foundFaculties, [faculty]);
        });
    });

    describe('Error tests', function () {
        it('should throw error if firstname or lastname is not supplied while creating', function *() {
                // No firstname
                let facultyTemp = master.faculty.template;
                facultyTemp.name = {
                    last: 'test2'
                };

                let faculty = new Faculty(facultyTemp);
                let errorThrown = false;
                try {
                    yield faculty.save();
                } catch (error) {
                    errorThrown = true;
                }

                if (!errorThrown) {
                    throw new Error('should complain about missing first name while creating faculty');
                }

                // No lastname
                facultyTemp.name = {
                    first: 'test2'
                };

                faculty = new Faculty(facultyTemp);
                errorThrown = false;
                try {
                    yield faculty.save();
                } catch (error) {
                    errorThrown = true;
                }

                if (!errorThrown) {
                    throw new Error('should complain about missing last name while creating faculty');
                }
            }
        );
    });
});
