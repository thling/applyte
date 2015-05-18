'use strict';

var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var json = require('koa-json');
var koa = require('koa');
var path = require('path');

var app = module.exports = koa();
var config = require('./config');

// Requires from the root (the file which 'npm start' script calls)
global.rootreq = function (reqPath) {
    return require(path.join(__dirname, reqPath));
};

// Logger
app.use(logger());

// JSON prettifier
if (config.jsonPrettify.prettify === true) {
    app.use(json(
        {
            pretty: true,
            spaces: config.jsonPrettify.indentWidth
        }
    ));
}

// Import routes
var router = rootreq('routes');
app.use(router.routes());

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

// If no parent (i.e. starting script), listen
if (!module.parent) {
    app.listen(config.port);
    console.log('listening on port 3000');
}
