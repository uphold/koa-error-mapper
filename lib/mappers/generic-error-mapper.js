'use strict';

/**
 * Module dependencies.
 */

let InvalidArgumentError = require('../errors/invalid-argument-error');
let http = require('http');
let snakeCase = require('snake-case');

/**
 * Export `GenericErrorMapper`.
 */

module.exports = {
  map: function(e) {
    if (!(e instanceof Error)) {
      throw new InvalidArgumentError('Exception is not an instance of `Error`');
    }

    let status = 500 > e.status ? e.status : 500;
    let code = http.STATUS_CODES[status];
    let message = http.STATUS_CODES[status];

    return {
      code: snakeCase(code),
      message: message
    };
  }
};
