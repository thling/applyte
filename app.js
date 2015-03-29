'use strict';
// var messages = require('./controllers/messages');
var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var koa = require('koa');
var path = require('path');
var app = module.exports = koa();

// Requires from the root (the file which 'npm start' script calls)
global.rootreq = function(reqPath) {
    return require(path.join(__dirname, reqPath));
}

// Logger
app.use(logger());

// Import routes
var router = rootreq('routes');
app.use(router.routes());

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}