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

        // These configurations will be used on production server
        production: {
            mode: 'production',
            db: process.env.MONGOLAB_URI,		// Production DB environment variable
            port: process.env.PORT 			// Production port environment variable
        },

        safemode: {
            // Fallback mode if nothing is set
            // DO NOT put any credentials here
            // DO NOT put any reference to production server here
            mode: 'safemode'
        }
};
