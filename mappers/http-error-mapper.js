'use strict';

/**
 * Module dependencies.
 */

const STATUS_CODE_TO_NAME = require('http').STATUS_CODES;

/**
 * `Error` mapper.
 */

module.exports.map = function(e) {
  const proto = Object.getPrototypeOf(e);

  if (!(proto.hasOwnProperty('expose') && proto.hasOwnProperty('status') && proto.hasOwnProperty('statusCode'))) {
    return;
  }

  return {
    body: {
      code: STATUS_CODE_TO_NAME[e.status].replace(/\s+/g, '_').toLowerCase(),
      message: e.expose ? e.message : STATUS_CODE_TO_NAME[e.status]
    },
    status: e.status
  };
};
