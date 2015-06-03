'use strict';

// Create a router object and use it everywhere
var router = require('koa-router')();

// Pass on router object to each of the routers
require('./api/program')(router);
require('./api/school')(router);

module.exports = router;
