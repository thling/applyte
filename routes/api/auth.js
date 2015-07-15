'use strict';

// Routing for area categories
let auth    = require(basedir + 'lib/auth').authenticator;
let authApi = require(basedir + 'controllers/api/auth');
let config  = require(basedir + 'config');
let userApi = require(basedir + 'controllers/api/user');
let verify  = require(basedir + 'lib/auth').verifier;

let apiBase = '/api/auth';

module.exports = function (router) {
    // For post request to signup, we will redirect
    // to User.createUser
    router.post(apiBase + '/signup', verify.csrf, verify.recaptcha, userApi.createUser);

    // Authenticate on login
    router.post(apiBase + '/login', verify.csrf, authApi.login);

    // Return a CSRF token for get requests
    router.get(apiBase + '/tokens', authApi.requestToken);

    // Refresh token
    router.put(apiBase + '/tokens/refresh', authApi.refreshToken);

    // For testing token
    router.post(apiBase + '/tokens/test', authApi.testToken);

    // Gets the apikey, only if authenticated
    router.get(apiBase + '/apikey', auth.admin, function *() {
        this.status = 200;
        this.body = {
            apikey: config.security.apiKey
        };
    });
};
