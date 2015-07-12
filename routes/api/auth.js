'use strict';

// Routing for area categories
let authApi = require(basedir + 'controllers/api/auth');
let userApi = require(basedir + 'controllers/api/user');

let apiBase = '/api/auth';

module.exports = function (router) {
    // Return a CSRF token for get requests
    router.get(apiBase + '/signup', authApi.requestToken);

    // For post request to signup, we will redirect
    // to User.createUser
    router.post(apiBase + '/signup', userApi.createUser);

    // Return a CSRF token for get requests
    router.get(apiBase + '/login', authApi.requestToken);

    // Authenticate on login
    router.post(apiBase + '/login', authApi.login);

    // Refresh token
    router.put(apiBase + '/refresh-token', authApi.refreshToken);

    router.get(apiBase + '/token-test', authApi.tokenTest);
};
