'use strict';

/**
 * `HttpError` mapper.
 */

module.exports = HttpError => {
  return {
    map(e) {
      if (HttpError && !(e instanceof HttpError)) {
        return;
      } else if (!(e.status && e.statusCode)) {
        return;
      }

      return {
        body: {
          code: e.message.replace(/\s+/g, '_').toLowerCase(),
          message: e.message
        },
        headers: e.headers,
        status: e.status
      };
    }
  };
};
