'use strict';

// Routing for programs
let schoolApi = require(basedir + 'controllers/api/school');
let apiBase = '/api/school';

module.exports = function (router) {
    // Gets the list of all schools
    router.get(apiBase + '/list', schoolApi.listSchools);

    // Gets the list of schools, paginated to start and length (optional ordering)
    router.get(apiBase + '/list/:start/:length/:order?', schoolApi.listSchools);

    // Gets the school by school id
    router.get(apiBase + '/id/:id', schoolApi.getSchoolById);

    // Gets the school by school name (many return multiple)
    router.get(apiBase + '/name/:name', schoolApi.getSchoolsByName);

    // Gets the school by school name and its campus (return only 1 school)
    router.get(apiBase + '/name/:name/:campus', schoolApi.getSchoolByNameCampus);

    // Gets the school by location of school
    router.get(
            apiBase + '/location/:country?/:state?/:city?/',
            schoolApi.getSchoolsByLocation
    );

    // Gets all the programs the school with specified id has
    router.get(apiBase + '/id/:id/programs', schoolApi.getSchoolPrograms);

    // Gets the school by its name and campus
    router.get(apiBase + '/name/:name/:campus/programs', schoolApi.getSchoolPrograms);

    // Creates a new school, returns an ID
    router.post(apiBase + '/create', schoolApi.createSchool);

    // Updates a school, returns changelog
    router.put(apiBase + '/update', schoolApi.updateSchool);

    // Deletes a school (needs admin), returns nothing
    router.delete(apiBase + '/delete', schoolApi.deleteSchool);
};
