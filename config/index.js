'use strict';

var _        = require('lodash');
var path     = require('path');
var config   = require('./config');
var defaults = require('./config.defaults');

// Decide which environment this app runs on
var nodeEnv = process.env.NODE_ENV;

// If the node environment is not defined, kill process (need better way)
// This SHOULD NOT happen
if (_.isUndefined(nodeEnv)) {
    console.error('Cannot find NODE_ENV environment variable; default to safemode');
    console.error('Please shutdown the app and set the NODE_ENV environment variable immediately');
    process.exit();
}

// Configure the basedir global variable
global.basedir = path.resolve(__dirname, '../') + '/';

// Requires from the root (the file which 'npm start' script calls)
global.rootreq = function (reqPath) {
    return require(basedir + reqPath);
};

// Export the correct configuration)
module.exports = _.assign(defaults, config[nodeEnv]);
