'use strict';

let _      = require('lodash');
let errors = require('./errors');

let BadRequestError = errors.BadRequestError;

/**
 * Parses a uri and returns its components. Unlike Node.js's built-in
 * url.parse function, this method will intelligently detect different
 * types of URI composition. Please refer to tests/lib/utils.js
 * for the tested and accepted forms of input.
 *
 * @param   origUri     An uri string
 * @return  An object of all the uri components of the following form:
 *      {
 *          uri: The parameter passed in, untouched (e.g. ssh://un:pw@t.co:1888/foo/bar?hi=30)
 *          protocol: undefined or the parts before :// (e.g. ssh)
 *          username: undefined or the username (e.g. un)
 *          password: undefined or the password (e.g. pw)
 *          host: undefined or the host + port part (e.g. t.co:1888)
 *          hostname: undefined or the host part (e.g. t.co)
 *          port: undefined or the port part in integer (e.g. 1888)
 *          path: undefined or the rest of the url (e.g. /foo/bar?hi=30)
 *      }
 */
module.exports.parseURI = function (origUri) {
    let uri = decodeURI(origUri);
    let host, hostname, password, path, port, protocol, username;
    let lastSlice = 0;

    // Determine the protocol
    let curSlice = uri.indexOf('://', lastSlice);
    if (curSlice >= 0) {
        protocol = uri.slice(lastSlice, curSlice);
        lastSlice = curSlice + 3;
    }

    // Determine the authentication part if existed
    curSlice = uri.indexOf('@', lastSlice);
    if (curSlice >= 0) {
        let authParts = uri.slice(lastSlice, curSlice).split(':');
        username = authParts[0];
        password = authParts[1];
        lastSlice = curSlice + 1;
    }

    // Determine the host and path parts
    curSlice = uri.indexOf('/', lastSlice);
    if (curSlice >= 0) {
        let hostSlice = uri.slice(lastSlice, curSlice);
        if (hostSlice.indexOf('.') > 0 || hostSlice === 'localhost') {
            // There is valid host part if there is something
            // between '://' and next first '/', or if it is
            // 'localhost' or contains a '.' before the first '/'
            host = hostSlice;
            lastSlice = curSlice;

            let hostParts = host.split(':');
            hostname = hostParts[0];
            port = hostParts[1];
        }

        // Parse the path part
        let pathSlice = uri.slice(lastSlice);
        if (pathSlice && pathSlice !== '') {
            path = pathSlice;
        }
    } else if (uri !== '') {
        // Check if there is a query string if there is no '/'
        // after '://'
        curSlice = uri.indexOf('?', lastSlice);

        if (curSlice >= 0) {
            // There is a query string in the path
            host = uri.slice(lastSlice, curSlice);
            path = uri.slice(curSlice);
        } else {
            // No path nor query string
            host = uri.slice(lastSlice);
        }

        let hostParts = host.split(':');
        hostname = hostParts[0];
        port = hostParts[1];
    }

    return {
        uri: uri,
        protocol: protocol,
        username: username,
        password: password,
        host: host,
        hostname: hostname,
        port: (port) ? parseInt(port) : port,
        path: path
    };
};

/**
 * Compose the param into link header format. The parameters
 * must be a object with its rel names as object properties
 * link urls as values.
 *
 * @param   links   The links to compose into link header field.
 *                  Must be a object with rel name as object property
 *                  and link urls as value
 * @return  The string that can be set in Link header
 */
module.exports.composeLinkHeader = function (links) {
    let ret = '';
    for (let rel in links) {
        if (ret !== '') {
            ret += ', ';
        }

        ret += '<' + links[rel] + '>; rel="' + rel + '"';
    }

    return ret;
};

/**
 * Parse the link header and return the prev, self, and next parts
 * of pagination links if available. This method will not return
 * anything else from the Link header; you will need to parse the
 * otherse manually.
 *
 * @param   linkHeader  The Link field of response header
 * @return  An object with properties prev, self, and next if
 *          exists in the Link header, in the following form:
 *      // Assuming url is http://localhost/api/start=5&limit=10
 *      {
 *          prev: Does not exist or the path to prev (e.g. /api/start=0&limit=10)
 *          self: Does not exist or the path to self (e.g. /api/start=5&limit=10)
 *          next: Does not exist or the path to next (e.g. /api/start=15&limit=10)
 *      }
 */
module.exports.parseLinkHeader = function (linkHeader) {
    let ret = {};

    if (linkHeader) {
        let links = linkHeader.replace(/[<>"]/g, '').split(', ');

        for (let link of links) {
            let parts = link.split('; rel=');
            ret[parts[1]] = this.parseURI(parts[0]).path;
        }
    }

    return ret;
};

/**
 * Parse query strings into object. Accepts URI; please see
 * tests/lib/utils.js for tested input for the parameters.
 *
 * This method will automatically decodeURI and parse any value
 * with || into an array.
 *
 * @param   str     The string to parse. Can be a URI.
 * @return  An object with query fields as properties
 *      // Example query: https://test.com:3000/api?test=333&name=John%20Doe%7C%7CBob%20Doeser
 *      {
 *          test: '333',
 *          name: ['John Doe', 'Bob Doeser']
 *      }
 *
 */
module.exports.parseQueryString = function (str) {
    let path, ret = {};
    let parsed = this.parseURI(str).path;

    // parseURI() will not parse query string format
    // as the 'path' element unless str is a well formed URI
    // so parsed.path may be undefined
    if (parsed) {
        path = parsed;
    } else if (!str.startsWith('?')) {
        // If parsed.path is undefined, str might be a query string
        // without the host part
        path = '?' + str;
    }

    let queryString = path.split('?')[1];
    let queries = queryString && queryString.split('&');

    for (let query of queries) {
        let pair = query.split('=');
        if ((!pair[0] || pair[0] === '') || (!pair[1] || pair[1] === '')) {
            // Skip if this is bad pair
            continue;
        }

        let value = decodeURI(pair[1]);
        if (value.indexOf('||') >= 0) {
            value = value.split('||');
        }

        ret[pair[0]] = value;
    }

    return ret;
};

/**
 * Asserts pagination information provided by the client, and formats
 * it accordingly. If any of the [start, limit, order, name] is not
 * provided in the query, the corresponding default value in
 * [1, 10, 'name', 'asc'] will be applied.
 *
 * @param   query   The query objet that might contain the pagination
 *                  information. This object will be mutated.
 */
module.exports.formatQueryPagination = function (query) {
    let pagination = {};

    if (query.start && query.start < 1) {
        throw new BadRequestError(422, 'Invalid start: ' + query.start);
    } else {
        pagination.start = (parseInt(query.start) || 1) - 1;
    }

    if (query.limit && (query.limit < 1 || query.limit > 100)) {
        throw new BadRequestError(422, 'Invalid limit: ' + query.limit);
    } else {
        pagination.limit = parseInt(query.limit) || 10;
    }

    if (query.sort && !(_.includes(['name'], query.sort))) {
        throw new BadRequestError(422, 'Invalid sort: ' + query.sort);
    } else {
        pagination.sort = query.sort || 'name';
    }

    if (query.order && !(_.includes(['asc', 'desc'], query.order))) {
        throw new BadRequestError(422, 'Invalid order: ' + query.order);
    } else {
        pagination.order = query.order || 'asc';
    }

    query.pagination = pagination;
};

/**
 * Format the string-represented list from request into an actual array.
 * If the listed fields are not found, it is ignored and nothing will
 * be set for the property.
 *
 * @param   query       The query object. This object will be mutated.
 * @param   listFields  The fields that might be in string-represented form.
 */
module.exports.formatQueryLists = function (query, listFields) {
    if (!_.isArray(listFields)) {
        listFields = [listFields];
    }

    for (let field of listFields) {
        if (query[field]) {
            query[field] = query[field].split('||');
        }
    }

};

/**
 * Generate pagination Link header if applicable.
 *
 * @param   origQuery   The original query object
 * @param   endpoint    The endpoint of this api (the key after host/api/)
 * @param   hasMore     Returned by the model, indicates whether there are
 *                      more data after self or not
 * @return  A string with the pagination parameters: self (always),
 *          prev and next (if applicable)
 */
module.exports.composePaginationLinkHeader = function (origQuery, endpoint, hasMore) {
    let query = _.omit(origQuery, ['pagination']);
    let base = 'http://applyte.io/api/' + endpoint + '?';

    // Parse each additional filter
    for (let filter in query) {
        let filterString = query[filter];
        if (_.isArray(filterString)) {
            filterString = filterString.join('||');
        }

        base += filter + '=' + encodeURI(filterString) + '&';
    }

    // Construct pagination part of query string
    let paginationQuery
            = 'limit=' + origQuery.pagination.limit + '&'
            + 'sort=' + origQuery.pagination.sort + '&'
            + 'order=' + origQuery.pagination.order;

    // Calculate pagination
    let selfStart = origQuery.pagination.start + 1;
    let nextStart = origQuery.pagination.start + origQuery.pagination.limit + 1;
    let prevStart = origQuery.pagination.start - origQuery.pagination.limit + 1;
    prevStart = (prevStart <= 0) ? 1 : prevStart;

    // Determine which links to include in the Link header
    let links = {};
    if (selfStart > 1) {
        links.prev = base + 'start=' + prevStart + '&' + paginationQuery;
    }

    links.self = base + 'start=' + selfStart + '&' + paginationQuery;

    if (hasMore) {
        links.next = base + 'start=' + nextStart + '&' + paginationQuery;
    }

    return this.composeLinkHeader(links);
};
