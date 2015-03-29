'use strict';

/**
 * `Error` mapper.
 */

module.exports.map = function(e) {
  if (!(e instanceof Error)) {
    return;
  }

  return {
    body: {
      code: 'internal_server_error',
      message: 'Internal Server Error'
    },
    status: 500
  };
};
