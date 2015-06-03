'use strict';

// Routing for programs
var schoolApi = require(basedir + 'controllers/api/school');

module.exports = function (router) {
    // Gets the list of all schools
    router.get('/api/school/list', schoolApi.listSchools);

    // Gets the list of schools, paginated to start and length (optionall ordering)
    router.get('/api/school/list/:start/:length/:order?', schoolApi.listSchools);

    // Gets the school by school id
    router.get('/api/school/id/:id', schoolApi.getSchoolById);

    // Gets the school by school name (many have multiple)
    router.get('/api/school/name/:name', schoolApi.getSchoolByName);

    // Gets all the programs the school with specified id has
    router.get('/api/school/id/:id/programs', schoolApi.getSchoolPrograms);

    // Creates a new school, returns an ID
    router.post('/api/school/create', schoolApi.createSchool);

    // Updates a school, returns changelog
    router.put('/api/school/update', schoolApi.updateSchool);

    // Deletes a school (needs admin), returns nothing
    router.delete('/api/school/delete', schoolApi.deleteSchool);
};
