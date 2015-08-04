'use strict';

// Routing for programs
let auth    = require(basedir + 'lib/auth').authenticator;
let userApi = require(basedir + 'controllers/api/user');
let config  = require(basedir + 'config');
let verify  = require(basedir + 'lib/auth').verifier;

let apiBase = '/api/users';

module.exports = function (router) {
    // Gets the list of all users
    // Currently blocking this query
    router.get(apiBase, function *() {
        this.status = 418;
        this.body = { message: this.message };
        return;
    }, userApi.query);

    // Gets the school by user id
    router.get(apiBase + '/:id', auth.user, userApi.getUserById);

    // Creates a new user, returns an ID
    router.post(apiBase, verify.csrf, verify.recaptcha, userApi.createUser);

    // Updates a user, returns changelog
    router.put(apiBase, auth.user, userApi.updateUser);

    // Deletes a user (needs admin), returns nothing
    router.delete(apiBase, auth.admin, userApi.deleteUser);

    // Only open this on development or test environment
    if (config.mode === 'test' || config.mode === 'development') {
        // Set user as verified
        router.put(apiBase + '/:id/verify', function *() {
            let User = require(basedir + 'models/user');
            let user = yield User.findById(this.params.id);
            user.setVerified();

            yield user.save();
            this.status = 200;
        });

        // Make the user as administrator
        router.put(apiBase + '/:id/makeAdmin', function *() {
            let User = require(basedir + 'models/user');
            let user = yield User.findById(this.params.id);
            user.setAccessRights('admin');

            yield user.save();
            this.status = 200;
        });
    }
};
