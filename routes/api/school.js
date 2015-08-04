'use strict';

// Routing for programs
let auth      = require(basedir + 'lib/auth').authenticator;
let schoolApi = require(basedir + 'controllers/api/school');
let apiBase = '/api/schools';

module.exports = function (router) {
    // Gets the list of all schools
    router.get(apiBase, schoolApi.query);

    // Gets the school by school id
    router.get(apiBase + '/:id', schoolApi.getSchoolById);

    // Gets all the programs the school with specified id has
    router.get(apiBase + '/:id/programs', schoolApi.getSchoolPrograms);

    // Gets the school by school name and its campus (return only 1 school)
    router.get(apiBase + '/:name/:campus', schoolApi.getSchoolByNameCampus);

    // Gets the school by its name and campus
    router.get(apiBase + '/:name/:campus/programs', schoolApi.getSchoolPrograms);

    // Creates a new school, returns an ID
    router.post(apiBase, auth.admin, schoolApi.createSchool);

    // Updates a school, returns changelog
    router.put(apiBase, auth.admin, schoolApi.updateSchool);

    // Deletes a school (needs admin), returns nothing
    router.delete(apiBase, auth.admin, schoolApi.deleteSchool);
};
