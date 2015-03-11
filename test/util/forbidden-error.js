'use strict';

/**
 * Module dependencies.
 */

let util = require('util');

/**
 * ForbiddenError error.
 */

function ForbiddenError() {
  this.name = this.constructor.name;
  this.status = 403;
}

/**
 * Inherits prototype.
 */

util.inherits(ForbiddenError, Error);

/**
 * Export constructor.
 */

module.exports = ForbiddenError;
