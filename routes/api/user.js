'use strict';

// Routing for programs
let userApi = require(basedir + 'controllers/api/user');
let apiBase = '/api/users';

module.exports = function (router) {
    // Gets the list of all schools
    router.get(apiBase, userApi.query);

    // Gets the school by school id
    // router.get(apiBase + '/:id', userApi.getUserById);

    // Creates a new school, returns an ID
    router.post(apiBase, userApi.createUser);

    // Updates a school, returns changelog
    // router.put(apiBase, userApi.updateUser);

    // Deletes a school (needs admin), returns nothing
    // router.delete(apiBase, userApi.deleteUser);
};
