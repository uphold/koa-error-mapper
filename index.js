'use strict';

/**
 * Module dependencies.
 */

let _ = require('lodash');
let debug = require('debug')('bitreserve:koa-error-mapper');
let genericErrorMapper = require('./mappers/generic-error-mapper');
let httpErrorMapper = require('./mappers/http-error-mapper');
let util = require('util');

/**
 * Export `ErrorMapperMiddleware`.
 */

module.exports = function(mappers) {
  mappers = (mappers || []).concat([httpErrorMapper, genericErrorMapper]);

  function map(e) {
    let mapping;

    for (const mapper of mappers) {
      mapping = mapper.map(e);

      if (undefined !== mapping) {
        break;
      }
    }

    return mapping;
  }

  return function *errors(next) {
    try {
      yield* next;

      // Force the default 404 to be a proper JSON response.
      if (this.status === 404 && undefined === this.response.body) {
        this.throw(404);
      }
    } catch (e) {
      let mapping;

      try {
        mapping = map(e);
      } catch (e) {
        mapping = map(e);
      }

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
