'use strict';

/**
 * Module dependencies.
 */

let _ = require('lodash');
let debug = require('debug')('bitreserve:koa-error-handler');
let genericErrorMapper = require('./mappers/generic-error-mapper');
let httpErrorMapper = require('./mappers/http-error-mapper');
let util = require('util');

/**
 * Export `ErrorHandlerMiddleware`.
 */

module.exports = function(mappers) {
  mappers = (mappers || []).concat([httpErrorMapper, genericErrorMapper]);

  return function *errors(next) {
    try {
      yield* next;

      // Force the default 404 to be a proper JSON response.
      if (this.status === 404 && undefined === this.response.body) {
        this.throw(404);
      }
    } catch (e) {
      let mapping;

      // Custom error mappers.
      _.forEach(mappers, function(mapper) {
        mapping = mapper.map(e);

        // Break the loop if a mapping is returned.
        if (mapping) {
          return false;
        }
      });

      // Update response.
      this.body = mapping.body;
      this.status = mapping.status;

      if (mapping.headers) {
        this.set(mapping.headers);
      }

      // Debug mapping.
      debug(util.inspect(mapping, { depth: 10 }));

      // Emit error.
      this.app.emit('error', e, this);
    }
  };
};
