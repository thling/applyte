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
            assert.notStrictEqual(user.password.salt, null);
            assert.notStrictEqual(user.password.hash, null);

            let hashed = bcrypt.hashSync(password, user.password.salt);
            assert.strictEqual(user.password.hash, hashed);
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

            master.user.assertEqual(user, template);
        });

        it('should not be able update read-only fields', function () {
            user.update({
                accessRights: 'admin',
                verified: false,
                created: 'hahaha',
                modified: 'noooo'
            });

            assert.strictEqual(user.accessRights, template.accessRights);
            assert.strictEqual(user.verified, template.verified);
            assert.strictEqual(user.created, template.created);
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
            });

            it('should update the database object properly', function *() {
                user.update({
                    accessRights: 'user'
                });

                yield user.save();
                let foundUser = yield User.findById(user.id);
                master.user.assertEqual(foundUser, user);
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

                cyiu.name.first = 'Cyiu';
                cyiu.name.middle = '';
                cyiu.name.last = 'Chau';

                ellen.name.first = 'Ellen';
                ellen.name.middle = '';
                ellen.name.last = 'Lai';

                kane.name.first = 'Kane';
                kane.name.middle = '';
                kane.name.last = 'Yang';

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
        });
    });
});
