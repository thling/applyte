'use strict';

// Routing for programs
let auth       = require(basedir + 'lib/auth').authenticator;
let programApi = require(basedir + 'controllers/api/program');

let apiBase = '/api/programs';

module.exports = function (router) {
    // List all available programs
    router.get(apiBase, programApi.query);

    // Fetch a particular one given ID
    router.get(apiBase + '/:id', programApi.getProgramById);

    // Fetch a particular one given ID
    router.get(apiBase + '/:id/areas', programApi.getProgramAreas);

    // Add new program, returns id
    router.post(apiBase, auth.admin, programApi.createProgram);

    // Update existing program, returns changelog
    router.put(apiBase, auth.admin, programApi.updateProgram);

    // Delete existing (need admin), returns nothing
    router.delete(apiBase, auth.admin, programApi.deleteProgram);
};
