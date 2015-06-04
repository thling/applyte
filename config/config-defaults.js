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

    // Server port to listen to
    port: 3000,

    // JSON Prettify settings
    jsonPrettify: {
        prettify: true,   // Whether to prettify JSON output
        indentWidth: 4    // Indentation width while printing
    }
};
