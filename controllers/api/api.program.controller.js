'use strict';

/**
 * Lists all the programs we have
 */
var list = function *() {
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
var listBySchoolId = function *() {
    this.body = {
        schoolId: this.params.schoolid,
        value: 'hello world for id'
    };
};

/**
 * List all programs from a specified school by school name
 */
var listBySchoolName = function *() {
    this.body = {
        schoolName: this.params.schoolname,
        value: 'hello world for name'
    };
};

// Export our methods
module.exports.list = list;
module.exports.listBySchoolId = listBySchoolId;
module.exports.listBySchoolName = listBySchoolName;
