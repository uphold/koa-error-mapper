'use strict';

/**
 * Module dependencies.
 */

const fallbackErrorMapper = require('./mappers/fallback-error-mapper');
const httpErrorMapper = require('./mappers/http-error-mapper');

/**
 * Export `ErrorMapperMiddleware`.
 */

module.exports = function(mappers) {
  mappers = (mappers || []).concat([httpErrorMapper, fallbackErrorMapper]);

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

  return async function errors(ctx, next) {
    try {
      await next();

      // Force the default 404 to be a proper JSON response.
      if (ctx.status === 404 && ctx.response.body === undefined) {
        ctx.throw(404);
      }
    } catch (e) {
      let mapping;

      try {
        mapping = map(e);
      } catch (e) {
        mapping = map(e);
      }

      // Update response.
      ctx.body = mapping.body;
      ctx.status = mapping.status;

      if (mapping.headers) {
        ctx.set(mapping.headers);
      }

      ctx.app.emit('error', e, ctx);
    }
  };
};
