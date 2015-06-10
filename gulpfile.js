'use strict';

let gulp = require('gulp');
let apidoc = require('gulp-apidoc');

gulp.task('default', ['apidoc']);

// apidoc generation
gulp.task('apidoc', function () {
    apidoc.exec({
        src: 'controllers/api/',
        dest: '../../Dropbox/Public/applyte_apidoc/'
    });
});
