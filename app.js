'use strict';

var compress = require('koa-compress');
var json     = require('koa-json');
var koa      = require('koa');
var logger   = require('koa-logger');
var path     = require('path');
var serve    = require('koa-static');
var config   = require('./config');
var router   = require('./routes');

// Initialize new Koa application
var app = module.exports = koa();

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
app.use(logger());

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
