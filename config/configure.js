'use strict';
var _ = require('lodash');

// Default configurations
var defaults = require('./config.defaults');

// List of configuration per environment
var config = require('./config');

// Decide which environment this app runs on
var nodeEnv = process.env.NODE_ENV;

// Fallback to safe mode to avoid leaking anything while support minimal operation
// This SHOULD NOT happen
if (_.isUndefined(nodeEnv)) {
    console.log("Cannot find NODE_ENV environment variable; default to safemode");
    console.log("Please shutdown the app and set the NODE_ENV environment variable immediately");
    nodeEnv = "safemode";
}

// Export the correct configuration)
module.exports = _.assign(defaults, config[nodeEnv]);