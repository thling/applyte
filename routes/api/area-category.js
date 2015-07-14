'use strict';

// Routing for area categories
let areaCategoryApi = require(basedir + 'controllers/api/area-category');
let auth            = require(basedir + 'lib/auth').authenticator;

let apiBase = '/api/area-categories';

module.exports = function (router) {
    // Gets the list of all area categories
    router.get(apiBase, areaCategoryApi.query);

    // Gets the school by area categories id
    router.get(apiBase + '/:id', areaCategoryApi.getAreaCategoryById);

    // Creates an new area category, returns an ID
    router.post(apiBase, auth.admin, areaCategoryApi.createAreaCategory);

    // Updates an area category, returns changelog
    router.put(apiBase, auth.admin, areaCategoryApi.updateAreaCategory);

    // Deletes an area category (needs admin), returns nothing
    router.delete(apiBase, auth.admin, areaCategoryApi.deleteAreaCategory);
};
