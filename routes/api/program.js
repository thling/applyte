'use strict';

// Routing for programs
let programApi = require(basedir + 'controllers/api/program');
let apiBase = '/api/program';

module.exports = function (router) {
    // List all available programs
    router.get(apiBase + '/list', programApi.listPrograms);

    // Pagination requests
    router.get(apiBase + '/list/:start/:length/:order?', programApi.listPrograms);

    // Fetch a particular one given ID
    router.get(apiBase + '/id/:id', programApi.getProgramById);

    // Fetch a particular program by name (may return multiple)
    router.get(apiBase + '/name/:name', programApi.getProgramsByName);

    // Fetch all programs by level
    router.get(apiBase + '/level/:level', programApi.getProgramsByLevel);

    // Find all programs with certain area
    router.get(apiBase + '/area/:area', programApi.getProgramByAreaName);

    // Gets all programs with areas that fall into the specified categories
    router.get(
            apiBase + '/categories/:categories',
            programApi.getProgramsByAreaCategories
    );

    // Add new program, returns id
    router.post(apiBase + '/create', programApi.createProgram);

    // Update existing program, returns changelog
    router.put(apiBase + '/update', programApi.updateProgram);

    // Delete existing (need admin), returns nothing
    router.delete(apiBase + '/delete', programApi.deleteProgram);
};
