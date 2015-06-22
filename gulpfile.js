'use strict';

var gulp = require('gulp');
var apidoc = require('gulp-apidoc');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');

gulp.task('default', ['lint']);

// apidoc generation
gulp.task('apidoc', function () {
    apidoc.exec({
        src: 'controllers/api/',
        dest: '../../Dropbox/Public/applyte_apidoc/'
    });
});

gulp.task('lint', function () {
    return gulp.src(['./**/*.js', '!./node_modules/**/*', '!./controllers/messages.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish))
        .pipe(jscs({
            esnext: true,
            configPath: './.jscsrc'
        }));
});
