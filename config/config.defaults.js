/**
 * Default configurations.
 *
 * Everything here will be overwritten by config.js if same configuration is available.
 */
module.exports = {
        // MongoDB URL
        "db": "mongodb://localhost:27017",

        // Server port to listen to
        "port": 3000,

        // JSON Prettify settings
        "jsonPrettify": {
            "prettify": true,   // Whether to prettify JSON output
            "indentWidth": 4    // Indentation width while printing
        }
};