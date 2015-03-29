'use strict';

// Routing for programs
var programApi = rootreq('controllers/api/api.program.controller');

module.exports = function(router) {
    // List all available programs
    router.get('/api/program/list', programApi.list);

    // List all availalbe programs from a school by school id
    router.get('/api/program/school/id/:schoolid', programApi.listBySchoolId);

    // List all availalbe programs from a school by school name
    router.get('/api/program/school/name/:schoolname', programApi.listBySchoolName);
}