'use strict';

/**
 * Module dependencies.
 */

let util = require('util');

/**
 * Generic InvalidArgumentError error.
 */

function InvalidArgumentError(message) {
  this.message = message;
  this.name = this.constructor.name;
}

/**
 * Inherits prototype.
 */

util.inherits(InvalidArgumentError, Error);

/**
 * Export constructor.
 */

module.exports = InvalidArgumentError;
