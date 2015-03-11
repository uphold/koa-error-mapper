'use strict';

/**
 * Module dependencies.
 */

let util = require('util');

/**
 * CustomError error.
 */

function CustomError() {
  this.name = this.constructor.name;
}

/**
 * Inherits prototype.
 */

util.inherits(CustomError, Error);

/**
 * Export constructor.
 */

module.exports = CustomError;
