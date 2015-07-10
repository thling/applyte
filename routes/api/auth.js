'use strict';

// Routing for area categories
let apiBase = '/api/auth';
let authApi = require(basedir + 'controllers/api/auth');

module.exports = function (router) {
    // Return a CSRF token for get requests
    router.get(apiBase + '/signup', authApi.requestToken);

    // For post request to signup, we will redirect
    // to User.createUser
    router.post(apiBase + '/signup', function *() {
        this.redirect('/api/users');
        this.status = 301;
    });

    // Return a CSRF token for get requests
    router.get(apiBase + '/login', authApi.requestToken);

    // Authenticate on login
    router.post(apiBase + '/login', authApi.login);
};
