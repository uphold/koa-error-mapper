'use strict';

/**
 * Module dependencies.
 */

let _ = require('lodash');
let GenericErrorMapper = require('./lib/mappers/generic-error-mapper');
let debug = require('debug')('bitreserve:koa-error-handler');
let util = require('util');

/**
 * Export `ErrorHandlerMiddleware`.
 */

module.exports = function(mappers) {
  mappers = mappers || {};

  return function *errors(next) {
    try {
      yield* next;
    } catch (e) {
      let mapping = GenericErrorMapper.map(e);

      // Custom error mappers.
      _.forEach(mappers, function(mapper, key) {
        if (e.name === key) {
          mapping = mapper.map(e);

          return false;
        }
      });

      // Update response.
      this.status = e.status || 500;
      this.body = mapping;

      // Debug mapping.
      debug(util.inspect(mapping, { depth: 10 }));

      // Emit error.
      this.app.emit('error', e, this);
    }
  };
};
