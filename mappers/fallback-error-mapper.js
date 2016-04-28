'use strict';

/**
 * Fallback error mapper.
 */

module.exports.map = function() {
  return {
    body: {
      code: 'internal_server_error',
      message: 'Internal Server Error'
    },
    status: 500
  };
};
