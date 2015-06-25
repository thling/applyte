'use strict';

let assert  = require('assert');
let master  = require('../test-master');
let User    = require('../../models/user');

require('co-mocha');

describe('User model test', function () {
    let template = master.user.template;
    let user;

    describe('User object basic functionality test', function () {
        it('should instantiate a user', function () {
            user = new User(master.user.template);
            master.user.assertEqual(user, template);
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
        it('should create user and generate proper ID and password', function *() {
            yield user.save();
            let newUser = yield User.findById(user.id);
            master.user.assertEqual(newUser, user);
        });
    });
});
