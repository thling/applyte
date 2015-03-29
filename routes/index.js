'use strict';

// Create a router object and use it everywhere
var router = module.exports = require('koa-router')();

// Pass on router object to each of the routers
require('./api.router')(router);
