'use strict';

let bodyParser = require('koa-bodyparser');
let compress   = require('koa-compress');
let csrf       = require('koa-csrf');
let helmet     = require('koa-helmet');
let json       = require('koa-json');
let koa        = require('koa');
let logger     = require('koa-logger');
let passport   = require('koa-passport');
let path       = require('path');
let serve      = require('koa-static');
let session    = require('koa-generic-session');
let config     = require('./config');
let router     = require('./routes');

require('./lib/auth');
let app;
module.exports = (function () {
    if (!app) {
        // Initialize new Koa application
        app = koa();

        // JSON prettifier
        if (config.jsonPrettify.prettify === true) {
            app.use(json(
                {
                    pretty: true,
                    spaces: config.jsonPrettify.indentWidth
                }
            ));
        }

        app.use(helmet.defaults());
        app.keys = config.security.appKeys;

        // Logger
        if (config.mode !== 'test') {
            app.use(logger());
        }

        // Body parser for HTTP request parsing
        app.use(bodyParser());

        // Serve static files
        app.use(serve(path.join(__dirname, 'public')));

        // Activates session
        app.use(session(config.sessionOptions));

        // Configure CSRF utility
        csrf(app);

        // Activate passport middleware
        app.use(passport.initialize());
        app.use(passport.session());

        // Import routes
        app.use(router.routes());

        // Compress middleware
        app.use(compress());

        // If no parent (i.e. starting script), listen
        if (!module.parent) {
            app.listen(config.port);

            if (config.mode === 'development') {
                console.log('listening on port ' + config.port);
            }
        }
    }

    return app;
}());
