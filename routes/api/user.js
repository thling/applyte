'use strict';

// Routing for programs
let userApi = require(basedir + 'controllers/api/user');
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
};
