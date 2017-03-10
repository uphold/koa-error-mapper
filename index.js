'use strict';

/**
 * Module dependencies.
 */

const fallbackErrorMapper = require('./mappers/fallback-error-mapper');
const httpErrorMapper = require('./mappers/http-error-mapper');

/**
 * Export `ErrorMapperMiddleware`.
 */

module.exports = function(mappers, HttpError) {
  if (typeof mappers === 'function') {
    HttpError = mappers;
    mappers = [];
  }

  mappers = (mappers || []).concat([httpErrorMapper(HttpError), fallbackErrorMapper]);

  function map(e) {
    let mapping;

    for (const mapper of mappers) {
      mapping = mapper.map(e);

      if (mapping !== undefined) {
        break;
      }
    }

    return mapping;
  }

  return function *errors(next) {
    try {
      yield* next;

      // Force the default 404 to be a proper JSON response.
      if (this.status === 404 && this.response.body === undefined) {
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

      this.app.emit('error', e, this);
    }
  };
};
