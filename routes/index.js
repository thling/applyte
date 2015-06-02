'use strict';

// Create a router object and use it everywhere
var router = require('koa-router')();

// Pass on router object to each of the routers
require('./api/api.program.router')(router);
require('./api/api.school.router')(router);

module.exports = router;
