'use strict';

// Routing for programs
var programApi = require(basedir + 'controllers/api/api.program.controller');

module.exports = function (router) {
    // List all available programs
    router.get('/api/program/list', programApi.listPrograms);

    // Pagination requests
    router.get('/api/program/list/:start/:length/:order?', programApi.listPrograms);

    // Fetch a particular one given ID
    router.get('/api/program/id/:id', programApi.getProgramById);

    // Fetch a particular program by name
    router.get('/api/program/name/:name', programApi.getProgramByName);

    // Add new
    router.post('/api/program/create', programApi.createProgram);

    // Delete existing (need apiKey)
    router.delete('/api/program/delete', programApi.deleteProgram);
};
