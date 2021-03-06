'use strict';

let _      = require('lodash');
let errors = require('./errors');

let BadRequestError = errors.BadRequestError;
let ExtraPropertyError = errors.ExtraPropertyError;
let MissingPropertyError = errors.MissingPropertyError;

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
module.exports.formatQueryPagination = function (query, sortables) {
    if (!sortables) {
        sortables = ['name'];
    }

    let pagination = {};

    if (query.start && query.start < 1) {
        throw new BadRequestError('Invalid start: ' + query.start, 422);
    } else {
        pagination.start = (parseInt(query.start) || 1) - 1;
    }

    if (query.limit && (query.limit < 1 || query.limit > 100)) {
        throw new BadRequestError('Invalid limit: ' + query.limit, 422);
    } else {
        pagination.limit = parseInt(query.limit) || 10;
    }

    if (query.sort && !(_.includes(sortables, query.sort))) {
        throw new BadRequestError('Invalid sort: ' + query.sort, 422);
    } else {
        pagination.sort = query.sort || 'name';
    }

    if (query.order && !(_.includes(['asc', 'desc'], query.order))) {
        throw new BadRequestError('Invalid order: ' + query.order, 422);
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
 * Parses the nested query string for range conditions.
 *
 * The query parameter will be mutated so that, if query has:
 *      {
 *          field1.gt: "30",    // "30" is string value
 *          field1.lt: 40
 *      }
 * it will become the following after running this function:
 *      {
 *          field1: {
 *              gt: 30      // 30 is parsed by parse in the listFields parameter
 *              lt: 40
 *          }
 *      }
 *
 * @param   query       The query object
 * @param   listFields  The list of fields to parse. The format
 *                      should be an object or an array:
 *                          [ {name: NAME, parser: FUNCTION} ]
 *                      where FUNCTION is the parser to pares the value.
 *                      If FUNCTION is not supplied, the value will be as is.
 */
module.exports.formatRangeConditions = function (query, listFields) {
    if (!_.isArray(listFields)) {
        listFields = [listFields];
    }

    // If parser is not supplied
    let returnAsIs = function (param) {
        return param;
    };

    // For each of the listed fields, parse the range
    for (let field of listFields) {
        let newField = {};
        let name = field.name, parser = field.parser;
        let ge, gt, le, lt;
        if (!parser) {
            parser = returnAsIs;
        }

        if (query[name + '.gt']) {
            gt = parser(query[name + '.gt']);
        }

        if (query[name + '.ge']) {
            ge = parser(query[name + '.ge']);
        }

        if (query[name + '.lt']) {
            lt = parser(query[name + '.lt']);
        }

        if (query[name + '.le']) {
            le = parser(query[name + '.le']);
        }

        // Filter invalid or redundant conditions
        // e.g. when there is gt and gt > ge, then ge is redundant
        if (gt && ge) {
            if (gt >= ge) {
                newField.gt = gt;
            } else {
                newField.ge = ge;
            }
        } else if (gt) {
            newField.gt = gt;
        } else if (ge) {
            newField.ge = ge;
        }

        if (lt && le) {
            if (lt <= le) {
                newField.lt = lt;
            } else {
                newField.le = le;
            }
        } else if (lt) {
            newField.lt = lt;
        } else if (le) {
            newField.le = le;
        }

        if (!_.isEmpty(newField)) {
            query[field.name] = newField;
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
            base += filter + '=' + encodeURI(filterString.join('||')) + '&';
        } else if (_.isPlainObject(filterString)) {
            if (filterString.le) {
                base += filter + '.le=' + encodeURI(filterString.le) + '&';
            }

            if (filterString.ge) {
                base += filter + '.ge=' + encodeURI(filterString.ge) + '&';
            }

            if (filterString.lt) {
                base += filter + '.lt=' + encodeURI(filterString.lt) + '&';
            }

            if (filterString.gt) {
                base += filter + '.gt=' + encodeURI(filterString.gt) + '&';
            }
        } else {
            base += filter + '=' + encodeURI(filterString) + '&';
        }
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

/**
 * Asserts the schema of an object matches another.
 *
 * @param   obj     The object to test against schema
 * @param   test    The 'schema' to test the object against
 * @param   options Optional. Specifies whether to check for missing or
 *                  for extra. Default to all options being true.
 *                  Use the format:
 *                      {
 *                          noMissing: true || false,
 *                          noExtra: true || false
 *                      }
 * @param   prefix  Optional. Used for nested pathing to clearly see the
 *                  path to the field that caused an error.
 */
module.exports.assertObjectSchema
        = function assertObjectSchema(obj, test, options, prefix) {
    // Create default properties
    let config = {
        noExtra: true,
        noMissing: true
    };

    if (options) {
        _.assign(config, options);
    }

    prefix = prefix || '';

    if (config.noExtra) {
        // Check for extra field
        _.forIn(obj, function (value, key) {
            if (!_.has(test, key)) {
                // If field is unnecessary, throw error
                throw new ExtraPropertyError(
                    'Found unexpected key \'' + prefix + key + '\''
                );
            }

            if (_.isObject(value) && !_.isEmpty(value)
                    && _.has(test, key) && _.isPlainObject(test[key])) {
                // If the value is also an object, we need to check it as well
                assertObjectSchema(value, test[key], config, key + '.');
            }
        });
    }

    if (config.noMissing) {
        // Check for missing fields
        _.forIn(test, function (value, key) {
            if (!_.has(obj, key)) {
                // If field missing, throw error
                throw new MissingPropertyError(
                    'Cannot find expected key \'' + prefix + key + '\''
                );
            }

            if (_.isObject(value) && !_.isEmpty(value)
                    && _.has(obj, key) && _.isPlainObject(obj[key])) {
                // If the value is also an object, we need to check it as well
                assertObjectSchema(obj[key], value, config, key + '.');
            }
        });
    }
};

/**
 * Recursively assign new data to an object. This does not handle
 * circular dependency. This function will not mutate the original
 * parameters.
 *
 * @param   obj     The object to assign new data to
 * @param   data    Object containing new data
 * @return  A new object with updated value
 */
module.exports.assignDeep = function assignDeep(obj, data) {
    _.forIn(data, function (value, key) {
        if (obj[key] && _.isPlainObject(obj[key]) && _.isPlainObject(value)) {
            // Assign nested objects
            assignDeep(obj[key], value);
        } else {
            // Assign a clone to avoid unintentional change of original objects
            obj[key] = _.cloneDeep(value);
        }
    });

    return obj;
};

/**
 * Removes properties with the same value in the second
 * parameter from the first parameter. The resulting object
 * will contain all changes or additions in the first parameter
 * that the second parameter does not have.
 *
 * Anything the second parameter has that the first parameter
 * does not have will not be shown. See the test cases for example.
 *
 * @param   newval  The parameter with changed values
 * @param   oldval  The parameter to diff against
 * @return  An object reflecting the changes in the newval parameter.
 *          It will be in the following form:
 *              {
 *                  new: {
 *                      key1: 'abcd'
 *                  },
 *                  old: {
 *                      key2: 'abc'
 *                  }
 *              }
 */
module.exports.diffObjects = function diffObjects(newval, oldval) {
    let changes = {
        new: {},
        old: {}
    };

    // Iterate through each of the new value
    _.forIn(newval, function (value, key) {
        if (!_.has(oldval, key)) {
            // If the new object has a key the old object doesn't, add it to new
            changes.new[key] = value;
        } else if (_.has(oldval, key) && value !== oldval[key]) {
            // If the values are not the same
            if (_.isArray(value) && _.isArray(oldval[key])) {
                // If both are array, do an array diff in case that
                // reference is different but values are the same
                let arrayDiff = _.difference(value, oldval[key]);

                // Only add to change list if differ
                if (!_.isEmpty(arrayDiff)) {
                    changes.new[key] = value;
                    changes.old[key] = oldval[key];
                }
            } else if (_.isPlainObject(value) && _.isPlainObject(oldval[key])) {
                // If both are plain object, do nested diff
                let nestedDiff = diffObjects(value, oldval[key]);

                // Only add to changelist if differ
                if (!_.isEmpty(nestedDiff.new)) {
                    changes.new[key] = nestedDiff.new;
                }

                if (!_.isEmpty(nestedDiff.old)) {
                    changes.old[key] = nestedDiff.old;
                }
            } else {
                // Otherwise, they are just different so add them
                changes.new[key] = value;
                changes.old[key] = oldval[key];
            }
        }
    });

    return changes;
};
