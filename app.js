'use strict';

let bodyParser = require('koa-bodyparser');
let compress   = require('koa-compress');
let json       = require('koa-json');
let koa        = require('koa');
let logger     = require('koa-logger');
let path       = require('path');
let serve      = require('koa-static');
let config     = require('./config');
let router     = require('./routes');

// Initialize new Koa application
let app = module.exports = koa();

// JSON prettifier
if (config.jsonPrettify.prettify === true) {
    app.use(json(
        {
            pretty: true,
            spaces: config.jsonPrettify.indentWidth
        }
    ));
}

// Logger
if (config.mode !== 'test') {
    app.use(logger());
}

// Body parser for HTTP request parsing
app.use(bodyParser());

// Import routes
app.use(router.routes());

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress middleware
app.use(compress());

// If no parent (i.e. starting script), listen
if (!module.parent) {
    app.listen(config.port);

    if (config.mode === 'development') {
        console.log('listening on port ' + config.port);
    }
}
