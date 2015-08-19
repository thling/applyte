'use strict';

let basedir = '../../';
let AdminDivision = require(basedir + 'models/admin-division');
let City          = require(basedir + 'models/city');
let Country       = require(basedir + 'models/country');
let master        = require(basedir + 'tests/test-master');

require('chai').should();
require('co-mocha');

describe('City, AdminDivision, Country combined model test', function () {
    describe('CRUD tests', function () {
        // Countries
        let imaginary, visionary;
        // AdminDivisions
        let imagCrazy, imagTest, visiPlay, visiTest;
        // Cities
        let imagCrazyYo, imagTestBoom, imagTestCrazy,
            visiPlayBeast, visiPlayHey, visiPlayRabbit, visiTestCrazy;

        after('clean up database', function *() {
            yield imaginary.delete();
            yield visionary.delete();

            yield imagCrazy.delete();
            yield imagTest.delete();
            yield visiPlay.delete();
            yield visiTest.delete();

            yield imagCrazyYo.delete();
            yield imagTestBoom.delete();
            yield imagTestCrazy.delete();
            yield visiPlayBeast.delete();
            yield visiPlayHey.delete();
            yield visiPlayRabbit.delete();
            yield visiTestCrazy.delete();
        });

        describe('Country CRUD tests', function () {
            it('should insert countries into database', function *() {
                // Setting up country
                imaginary = new Country(master.country.template);
                yield imaginary.save();

                let visionaryTemplate = master.country.template;
                visionaryTemplate.name = 'Visionary';
                visionary = new Country(visionaryTemplate);
                yield visionary.save();
            });

            it('should be able to query country by name (primary key)', function *() {
                let foundCountry = yield Country.findByName(imaginary.name);
                master.country.assertEqual(foundCountry, imaginary);
            });

            it('should work with index search', function *() {
                let foundCountries = yield Country.findByAbbrev(imaginary.abbrev);

                // We purposedly didn't change visionary's abbreviation to test this
                foundCountries.length.should.equal(2);
                let obj1 = foundCountries[0], obj2 = foundCountries[1];

                if (obj1.name === 'Visionary') {
                    obj2.name.should.equal('Imaginary');
                } else {
                    obj1.name.should.equal('Imaginary');
                    obj2.name.should.equal('Visionary');
                }

                obj1.abbrev.should.equal('IG');
                obj2.abbrev.should.equal('IG');
            });

            it('should assign an empty string to `abbrev` attribute if none is supplied', function *() {
                let testCountry = new Country({
                    name: 'Shit'
                });

                yield testCountry.save();
                testCountry.should.have.property('abbrev', '');
                yield testCountry.delete();
            });

            it('should handle update properly (ignore name changes)', function *() {
                imaginary.update({
                    name: 'test',
                    abbrev: 'imag'
                });

                yield imaginary.save();
                imaginary.should.have.property('name', 'Imaginary');
                imaginary.should.have.property('abbrev', 'imag');

                imaginary.update({
                    abbrev: 'IG'
                });
                yield imaginary.save();
                imaginary.should.have.property('abbrev', 'IG');
            });
        });

        describe('AdminDivision CRUD tests', function () {
            it('should insert admin divisions into databases properly', function *() {
                imagCrazy = new AdminDivision(master.adminDivision.template);
                imagCrazy.name = 'Crazy';
                imagCrazy.abbrev = 'CR';
                yield imagCrazy.save();
                imagCrazy.should.have.property('id');

                imagTest = new AdminDivision(master.adminDivision.template);
                yield imagTest.save();
                imagTest.should.have.property('id');

                visiPlay = new AdminDivision(master.adminDivision.template);
                visiPlay.name = 'Play';
                visiPlay.abbrev = 'PL';
                visiPlay.country = 'Visionary';
                yield visiPlay.save();
                visiPlay.should.have.property('id');

                visiTest = new AdminDivision(master.adminDivision.template);
                visiTest.country = 'Visionary';
                yield visiTest.save();
                visiTest.should.have.property('id');
            });

            it('should be able to retrieve admin divisions by id', function *() {
                let foundDiv = yield AdminDivision.findById(imagCrazy.id);
                master.adminDivision.assertEqual(foundDiv, imagCrazy);
            });

            it('should be able to find by name index', function *() {
                let foundDivs = yield AdminDivision.findByName(imagTest.name);
                master.listEquals(foundDivs, [visiTest, imagTest]);
            });

            it('should be able to find by abbrev index', function *() {
                let foundDivs = yield AdminDivision.findByAbbrev(visiPlay.abbrev);
                master.listEquals(foundDivs, [visiPlay]);
            });

            it('should be able to find by country', function *() {
                let foundDivs = yield AdminDivision.findByCountry(imaginary.name);
                master.listEquals(foundDivs, [imagTest, imagCrazy]);

                foundDivs = yield AdminDivision.findByCountry(visionary.name);
                master.listEquals(foundDivs, [visiTest, visiPlay]);
            });

            it('should update properly', function *() {
                visiPlay.update({
                    country: imaginary.name
                });

                yield visiPlay.save();
                let foundDiv = yield AdminDivision.findById(visiPlay.id);

                master.adminDivision.assertEqual(foundDiv, visiPlay);

                visiPlay.country = visionary.name;
                yield visiPlay.save();
            });
        });

        describe('City CRUD test', function () {
            it('should be able to insert properly', function *() {
                imagCrazyYo = new City({
                    name: 'Yo',
                    adminDivision: imagCrazy.name,
                    adminDivisionId: imagCrazy.id,
                    country: imaginary.name
                });

                imagTestBoom = new City({
                    name: 'Boom',
                    adminDivision: imagTest.name,
                    adminDivisionId: imagTest.id,
                    country: imaginary.name
                });

                imagTestCrazy = new City({
                    name: 'Crazy',
                    adminDivision: imagTest.name,
                    adminDivisionId: imagTest.id,
                    country: imaginary.name
                });

                visiPlayBeast = new City({
                    name: 'Beast',
                    adminDivision: visiPlay.name,
                    adminDivisionId: visiPlay.id,
                    country: visionary.name
                });

                visiPlayHey = new City({
                    name: 'Hey',
                    adminDivision: visiPlay.name,
                    adminDivisionId: visiPlay.id,
                    country: visionary.name
                });

                visiPlayRabbit = new City({
                    name: 'Rabbit',
                    adminDivision: visiPlay.name,
                    adminDivisionId: visiPlay.id,
                    country: visionary.name
                });

                visiTestCrazy = new City({
                    name: 'Crazy',
                    adminDivision: visiTest.name,
                    adminDivisionId: visiTest.id,
                    country: visionary.name
                });

                yield imagCrazyYo.save();
                yield imagTestBoom.save();
                yield imagTestCrazy.save();
                yield visiPlayBeast.save();
                yield visiPlayHey.save();
                yield visiPlayRabbit.save();
                yield visiTestCrazy.save();

                imagCrazyYo.should.have.property('id');
                imagTestBoom.should.have.property('id');
                imagTestCrazy.should.have.property('id');
                visiPlayBeast.should.have.property('id');
                visiPlayHey.should.have.property('id');
                visiPlayRabbit.should.have.property('id');
                visiTestCrazy.should.have.property('id');
            });

            it('should assign empty string to adminDivision if not provided on creation',
                function *() {
                    let testCity = new City({
                        name: 'testCity',
                        country: visionary.name
                    });

                    yield testCity.save();

                    testCity.should.have.property('adminDivision', '');
                    testCity.should.have.property('adminDivisionId', null);

                    let foundCities = yield City.findByCountry(visionary.name);
                    master.listEquals(
                            foundCities,
                            [visiTestCrazy, visiPlayBeast, visiPlayHey, visiPlayRabbit, testCity]
                    );

                    yield testCity.delete();
                }
            );

            it('should be able to find by id', function *() {
                let foundCity = yield City.findById(imagTestCrazy.id);
                master.city.assertEqual(foundCity, imagTestCrazy);
            });

            it('should be able to find by name using index', function *() {
                let foundCities = yield City.findByName(imagTestCrazy.name);
                master.listEquals(foundCities, [imagTestCrazy, visiTestCrazy]);
            });


            it('should be able to find by subdivision (adminDiv + country)', function *() {
                let foundCities = yield City.findBySubdivision(imagCrazy.name, imagCrazy.country);
                master.listEquals(foundCities, [imagCrazyYo]);
            });

            it('should be able to find by admin division id', function *() {
                let foundCities = yield City.findByAdminDivisionId(visiPlay.id);
                master.listEquals(foundCities, [visiPlayHey, visiPlayBeast, visiPlayRabbit]);
            });

            it('should be able to find by country using index', function *() {
                let foundCities = yield City.findByCountry(visionary.name);
                master.listEquals(
                        foundCities,
                        [visiPlayHey, visiPlayBeast, visiPlayRabbit, visiTestCrazy]
                );
            });

            it('should be able to update properly', function *() {
                visiTestCrazy.country = imaginary.name;
                yield visiTestCrazy.save();

                let foundCities = yield City.findByCountry(imaginary.name);
                master.listEquals(
                        foundCities,
                        [imagCrazyYo, imagTestBoom, imagTestCrazy, visiTestCrazy]
                );
            });
        });
    });
});
