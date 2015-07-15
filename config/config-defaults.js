'use strict';

/**
 * Default configurations.
 *
 * Everything here will be overwritten by config.js if same configuration is available.
 */
module.exports = {
    // RethinkDB development connection
    rethink: {
        host: 'localhost',  // Hostname
        port: 28015,        // Port for DB connection
        db: 'applyte'    // Default database name
    },

    // Session related options (base on koa-generic-session)
    sessionOptions: {
        key: 'applyte.sid',
        prefix: 'applyte:sess:'
    },

    // Security configurations
    security: {
        apiKey: 'testkey',
        jwtSecret: 'this is a crazy jwt secret',
        appKeys: ['This is my secret'],  // Cookie signing keys, change in production
        hashRounds: 10  // Number of rounds to hash
    },

    // Server port to listen to
    port: 3000,

    // JSON Prettify settings
    jsonPrettify: {
        prettify: true,   // Whether to prettify JSON output
        indentWidth: 4    // Indentation width while printing
    }
};
