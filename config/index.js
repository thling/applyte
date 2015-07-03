'use strict';

let path     = require('path');
let config   = require('./config');
let defaults = require('./config-defaults');
let utils    = require('../lib/utils');

// Decide which environment this app runs on
let nodeEnv = process.env.NODE_ENV;

// If the node environment is not defined, kill process (need better way)
// This SHOULD NOT happen
if (!nodeEnv) {
    console.error('Cannot find NODE_ENV environment variable; default to safemode');
    console.error('Please shutdown the app and set the NODE_ENV environment variable immediately');
    throw new Error('Cannot find NODE_ENV environment variable');
}

// Configure the basedir global variable
global.basedir = path.resolve(__dirname, '../') + '/';

// Requires from the root (the file which 'npm start' script calls)
global.rootreq = function (reqPath) {
    return require(basedir + reqPath);
};

// Export the correct configuration)
module.exports = utils.assignDeep(defaults, config[nodeEnv]);
