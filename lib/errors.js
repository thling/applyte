'use strict';

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

module.exports.BadRequestError = BadRequestError;
