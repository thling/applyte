'use strict';

/**
 * BadRequestError
 *
 * The error for invalid HTTP requests.
 */
let BadRequestError = function (statusCode, message) {
    this._name = 'BadRequestError';
    this._message = message || 'Bad request';
    this._statusCode = statusCode || 400;
};

BadRequestError.prototype = {
    get type() {
        return this._name;
    },
    get message() {
        return this._message;
    },
    get statusCode() {
        return this.statusCode;
    },

    /**
     * Populates the Koa instance with status code and return message
     * using values from this error.
     *
     * @param   ctx     The context to populate
     */
    generateContext: function (ctx) {
        ctx.status = this._statusCode;
        ctx.body = {
            message: this._message
        };
    },
    toString: function () {
        return '[' + this._name + '] '
                + this._statusCode
                + ': ' + this._message;
    }
};


/**
 * ExtraPropertyError
 *
 * The error for having extra or unexpected properties in an object.
 */
let ExtraPropertyError = function (message) {
    this._name = 'ExtraPropertyError';
    this._message = message || 'Unexpected property found';
};

ExtraPropertyError.prototype = {
    get type() {
        return this._name;
    },
    get message() {
        return this._message;
    },
    toString: function () {
        return '[' + this._name + '] ' + this.message;
    }
};


/**
 * MissingPropertyError
 *
 * The error for not having any expected properties in an object.
 */
let MissingPropertyError = function (message) {
    this._name = 'MissingPropertyError';
    this._message = message || 'Could not find expected property';
};

MissingPropertyError.prototype = {
    get type() {
        return this._name;
    },
    get message() {
        return this._message;
    },
    toString: function () {
        return '[' + this._name + '] ' + this.message;
    }
};

module.exports.BadRequestError = BadRequestError;
module.exports.ExtraPropertyError = ExtraPropertyError;
module.exports.MissingPropertyError = MissingPropertyError;
