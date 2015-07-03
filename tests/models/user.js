'use strict';

let _       = require('lodash');
let assert  = require('assert');
let bcrypt  = require('bcrypt');
let master  = require('../test-master');
let User    = require('../../models/user');

require('co-mocha');

describe('User model test', function () {
    let password = 'This is secret password';
    let template = master.user.template;
    let user;

    describe('User object basic functionality test', function () {
        it('should instantiate a user', function () {
            user = new User(master.user.template);
            master.user.assertEqual(user, template);
        });

        it('should proper set password', function () {
            user.setPassword(password);
            assert.notStrictEqual(user.password, null);

            let passwordMatched = bcrypt.compareSync(password, user.password);
            assert(passwordMatched, 'Password does not match');
            template.password = _.cloneDeep(user.password);
        });

        it('should get the full name', function () {
            assert.strictEqual(
                    user.getFullname(),
                    template.name.first + ' '
                            + template.name.middle + ' '
                            + template.name.last
            );
        });

        it('should get the preferred name', function () {
            assert.strictEqual(
                user.getPreferredName(),
                template.name.preferred
            );
        });

        it('should properly update a user (offline)', function () {
            user.update({
                name: {
                    preferred: 'Samuel Beasto'
                },
                contact: {
                    email: 'ling21@purdue.edu',
                    address: {
                        address1: '320 S. Grant St.',
                        address2: 'Apt. 424'
                    }
                }
            });

            template.name.preferred = 'Samuel Beasto';
            template.contact.email = 'ling21@purdue.edu';
            template.contact.address.address1 = '320 S. Grant St.';
            template.contact.address.address2 = 'Apt. 424';
            template.verified = false;

            master.user.assertEqual(user, template);
        });

        it('should not be able update read-only fields', function () {
            user.update({
                accessRights: 'admin',
                verified: true,
                created: 'hahaha',
                modified: 'noooo'
            });

            master.user.assertEqual(user, template);
        });

        it('should process authentication step properly', function () {
        });
    });

    describe('User database test', function () {
        describe('Basic database test', function () {
            after('clean up database', function *() {
                yield user.delete();
            });

            it('should create user and generate proper ID and password', function *() {
                yield user.save();
                let foundUser = yield User.findById(user.id);
                master.user.assertEqual(foundUser, user);

                // Set verified to true for testing purposes
                user.verified = true;
                yield user.save();
            });

            it('should update the database object properly', function *() {
                user.update({
                    accessRights: 'user'
                });

                yield user.save();
                let foundUser = yield User.findById(user.id);
                master.user.assertEqual(foundUser, user);
            });

            it('should set veriified to false if email is updated', function *() {
                assert.strictEqual(user.verified, true);

                user.update({
                    contact: {
                        email: 'test@gmail.com'
                    }
                });

                yield user.save();
                assert.strictEqual(user.verified, false);

                user.verified = true;
                yield user.save();
            });
        });

        describe('Complex database test', function () {
            let bruce, cyiu, ellen, kane, sam;
            let users;

            before('set up database', function *() {
                bruce = new User(master.user.template);
                cyiu = new User(master.user.template);
                ellen = new User(master.user.template);
                kane = new User(master.user.template);
                sam = new User(master.user.template);

                users = [bruce, cyiu, ellen, kane, sam];

                bruce.name.first = 'Bruce';
                bruce.name.middle = '';
                bruce.name.last = 'Weng';
                bruce.contact.email = 'bruce@purdue.edu';

                cyiu.name.first = 'Cyiu';
                cyiu.name.middle = '';
                cyiu.name.last = 'Chau';
                cyiu.contact.email = 'cyiu@purdue.edu';

                ellen.name.first = 'Ellen';
                ellen.name.middle = '';
                ellen.name.last = 'Lai';
                ellen.contact.email = 'ellen@purdue.edu';

                kane.name.first = 'Kane';
                kane.name.middle = '';
                kane.name.last = 'Yang';
                kane.contact.email = 'kane@purdue.edu';

                for (let user of users) {
                    yield user.save();
                }
            });

            after('clean up database', function *() {
                for (let user of users) {
                    yield user.delete();
                }
            });

            it('should list all users', function *() {
                let foundUsers = yield User.getAllUsers();
                master.listEquals(foundUsers, users);
            });

            it('should throw an error after creating a duplicated user', function *() {
                let testUser = new User(master.user.template);
                try {
                    yield testUser.save();
                } catch (error) {
                    if (error) {
                        assert.strictEqual(
                                error.message,
                                'User with email '
                                        + testUser.contact.email + ' '
                                        + 'already existed'
                        );
                    }
                }
            });
        });
    });
});
