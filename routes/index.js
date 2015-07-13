'use strict';

// Create a router object and use it everywhere
let router = require('koa-router')();

router.use(function *(next) {
    try {
        yield next;
    } catch (error) {
        if (error.type === 'UserNotAuthorizedError') {
            error.generateContext(this);
        } else {
            throw error;
        }
    }
});

// Pass on router object to each of the routers
require('./api/program')(router);
require('./api/school')(router);
require('./api/area-category')(router);
require('./api/user')(router);
require('./api/auth')(router);

module.exports = router;
