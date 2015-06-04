'use strict';

// Routing for area categories
let areaCategoryApi = require(basedir + 'controllers/api/area-category');
let apiBase = '/api/area-category';

module.exports = function (router) {
    // Gets the list of all area categories
    router.get(apiBase + '/list', areaCategoryApi.listAreaCategories);

    // Gets the list of area categories, paginated to start and length (optionall ordering)
    router.get(apiBase + '/list/:start/:length/:order?', areaCategoryApi.listAreaCategories);

    // Gets the school by area categories id
    router.get(apiBase + '/id/:id', areaCategoryApi.getAreaCategoryById);

    // Gets the school by area categories name (many return multiple)
    router.get(apiBase + '/name/:name', areaCategoryApi.getAreaCategoryByName);

    // Creates an new area category, returns an ID
    router.post(apiBase + '/create', areaCategoryApi.createAreaCategory);

    // Updates an area category, returns changelog
    router.put(apiBase + '/update', areaCategoryApi.updateAreaCategory);

    // Deletes an area category (needs admin), returns nothing
    router.delete(apiBase + '/delete', areaCategoryApi.deleteAreaCategory);
};
