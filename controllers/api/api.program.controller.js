'use strict';

let thinky = require(basedir + 'models/thinky');

/**
 * Lists all the programs we have
 */
 module.exports.list = function *() {
    this.body = [
        {
            schoolId: '123',
            schoolName: 'yo'
        },
        {
            schoolId: '124',
            schoolName: 'Ha'
        }
    ];
};

/**
 * List all programs from a specified school by school ID
 */
 module.exports.listBySchoolId = function *() {
    this.body = {
        schoolId: this.params.schoolid,
        value: 'hello world for id'
    };
};

/**
 * List all programs from a specified school by school name
 */
 module.exports.listBySchoolName = function *() {
    this.body = {
        schoolName: this.params.schoolname,
        value: 'hello world for name'
    };
};
