'use strict';

let bodyParser = require('koa-bodyparser');
let compress   = require('koa-compress');
let csrf       = require('koa-csrf');
let helmet     = require('koa-helmet');
let json       = require('koa-json');
let jwt        = require('koa-jwt');
let koa        = require('koa');
let logger     = require('koa-logger');
let passport   = require('koa-passport');
let session    = require('koa-generic-session');
let RdbSession = require('koa-generic-session-rethinkdb');
let rdbDash    = require('rethinkdbdash');
let config     = require('./config');
let router     = require('./routes');

require('./lib/auth').passport();

let app;
module.exports = (function () {
    if (!app) {
        // Initialize new Koa application
        app = koa();

        // JSON prettifier
        if (config.jsonPrettify.prettify === true) {
            app.use(json({
                    pretty: true,
                    spaces: config.jsonPrettify.indentWidth
            }));
        }

        app.use(helmet.defaults());
        app.keys = config.security.appKeys;

        // Logger
        if (config.mode !== 'test') {
            app.use(logger());
        }

        // Body parser for HTTP request parsing
        app.use(bodyParser());

        // Create RethinkDB session store
        let sessionStore = new RdbSession({
            connection: rdbDash({
                host: config.session.host,
                port: config.session.port
            }),
            db: config.session.db,
            table: config.session.table
        });

        sessionStore.setup();

        // Activates session
        app.use(session({
            key: config.session.key,
            prefix: config.session.prefix,
            store: sessionStore
        }));

        // Configure CSRF utility
        csrf(app);

        // Activate passport middleware
        app.use(passport.initialize());
        app.use(passport.session());

        // Activate JSON Web Token
        app.use(jwt({
            secret: config.security.jwtSecret,
            passthrough: true,
            debug: (config.mode !== 'production')
        }));

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
