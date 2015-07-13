'use strict';

// Routing for programs
let userApi = require(basedir + 'controllers/api/user');
let config  = require(basedir + 'config');
let apiBase = '/api/users';

module.exports = function (router) {
    // Gets the list of all users
    router.get(apiBase, userApi.query);

    // Gets the school by user id
    router.get(apiBase + '/:id', userApi.getUserById);

    // Creates a new user, returns an ID
    router.post(apiBase, userApi.createUser);

    // Updates a user, returns changelog
    router.put(apiBase, userApi.updateUser);

    // Deletes a user (needs admin), returns nothing
    router.delete(apiBase, userApi.deleteUser);

    // Only open this on development or test environment
    if (config.mode === 'test' || config.mode === 'development') {
        router.put(apiBase + '/:id/verify', function *() {
            let User = require(basedir + 'models/user');
            let user = yield User.findById(this.params.id);
            user.setVerified();

            yield user.save();
            this.status = 200;
        });

        router.put(apiBase + '/:id/makeAdmin', function *() {
            let User = require(basedir + 'models/user');
            let user = yield User.findById(this.params.id);
            user.setAccessRights('admin');

            yield user.save();
            this.status = 200;
        });
    }
};
