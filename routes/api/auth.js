'use strict';

// Routing for area categories
let authApi = require(basedir + 'controllers/api/auth');
let userApi = require(basedir + 'controllers/api/user');

let apiBase = '/api/auth';

module.exports = function (router) {
    // For post request to signup, we will redirect
    // to User.createUser
    router.post(apiBase + '/signup', userApi.createUser);

    // Authenticate on login
    router.post(apiBase + '/login', authApi.login);

    // Return a CSRF token for get requests
    router.get(apiBase + '/tokens', authApi.requestToken);

    // Refresh token
    router.put(apiBase + '/tokens/refresh', authApi.refreshToken);

    // For testing token
    router.post(apiBase + '/tokens/test', authApi.testToken);
};
