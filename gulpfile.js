'use strict';

let gulp = require('gulp');
let eslint = require('gulp-eslint');
let apidoc = require('gulp-apidoc');

gulp.task('default', ['lint']);

// apidoc generation
gulp.task('apidoc', function () {
    apidoc.exec({
        src: 'controllers/api/',
        dest: '../../Dropbox/Public/applyte_apidoc/'
    });
});

gulp.task('lint', function () {
    return gulp.src(['./**/*.js', '!./node_modules/**/*'])
        .pipe(eslint())
        .pipe(eslint.format());
});
