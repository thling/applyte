'use strict';

/**
 * Per envrionment configuration.
 *
 * Anything not specified here will inherit from config.defaults.js.
 */
module.exports = {
	// Make sure your local development machine has
	// environment variable "NODE_ENV" set to "development"
    development: {
        mode: 'development'
    },

    // These configurations will be used on staging branch/server
    staging: {
        mode: 'staging'
    },

    // Test environment
    test: {
        mode: 'test'
    },

    // These configurations will be used on production server
    production: {
        mode: 'production',
        rethink: {
            host: process.env.RETHINKDB_HOST,
            port: process.env.RETHINKDB_PORT,
            db: process.env.RETHINKDB_DBNAME
        },
        security: {
            apiKey: process.env.API_KEY,
            jwtSecret: process.env.JWT_SECRET,
            appKeys: (process.env.APP_KEYS || '').split(','),
            recaptchaSecret: process.env.RECAPTCHA_SECRET
        },
        port: process.env.PORT
    },

    safemode: {
        // Fallback mode if nothing is set
        // DO NOT put any credentials here
        // DO NOT put any reference to production server here
        mode: 'safemode'
    }
};
