'use strict';

/**
 * Fallback error mapper.
 */

module.exports.map = function(e) {
  return {
    body: {
      code: 'internal_server_error',
      message: 'Internal Server Error'
    },
    status: 500
  };
};
