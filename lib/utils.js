'use strict';

/**
 * Parses a uri and returns its components. This method will intelligently
 * detect different type of URI composition. Please refer to tests/lib/utils.js
 * for the tested and accepted forms of input.
 *
 * @param   uri     An uri string
 * @return  An object of all the uri components of the following form:
 *      {
 *          uri: The parameter passed in, untouched (e.g. ssh://t.co:1888/foo/bar?hi=30)
 *          protocol: undefined or the parts before :// (e.g. ssh)
 *          host: undefined or the host + port part (e.g. t.co:1888)
 *          hostname: undefined or the host part (e.g. t.co)
 *          port: undefined or the port part in integer (e.g. 1888)
 *          path: undefined or the rest of the url (e.g. /foo/bar?hi=30)
 *      }
 */
module.exports.parseURI = function (uri) {
    let protocol, host, hostname, port, path;
    let lastSlice = 0;

    // Determine the protocol
    let curSlice = uri.indexOf('://', lastSlice + 1);
    if (curSlice >= 0) {
        protocol = uri.slice(lastSlice, curSlice);
        lastSlice = curSlice + 3;
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
        host: host,
        hostname: hostname,
        port: (port)? parseInt(port) : port,
        path: path
    };
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
module.exports.getPaginationLinks = function (linkHeader) {
    let ret = {};

    if (linkHeader) {
        let links = linkHeader.replace(/[<>"]/g, '').split(', ');

        for (let link of links) {
            let parts = link.split('; rel=');

            // Filter out unnecessary elements
            if (['prev', 'next', 'self'].indexOf(parts[1]) < 0) {
                continue;
            }

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
    let ret = {}, path;
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
