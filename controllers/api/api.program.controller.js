'use strict';

/**
 * Lists all the programs we have
 */
var list = function *() {
    this.body = "hello world";
}

/**
 * List all programs from a specified school by school ID
 */
var listBySchoolId = function *() {
    this.body = "hello world for " + this.params.schoolid;
}

/**
 * List all programs from a specified school by school ID
 */
var listBySchoolName = function *() {
    this.body = "hello world for " + this.params.schoolname;
}

// Export our methods
module.exports.list = list;
module.exports.listBySchoolId = listBySchoolId;
module.exports.listBySchoolName = listBySchoolName;