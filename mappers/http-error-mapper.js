'use strict';

/**
 * Module dependencies.
 */

const STATUS_CODE_TO_NAME = require('http').STATUS_CODES;

let _ = require('lodash');

/**
 * `Error` mapper.
 */


module.exports.map = function(e) {
  let proto = Object.getPrototypeOf(e);

  if (!(_.has(proto, 'expose') && _.has(proto, 'status') && _.has(proto, 'statusCode') )) {
    return;
  }

  return {
    body: {
      code: _.snakeCase(STATUS_CODE_TO_NAME[e.status]),
      message: e.expose ? e.message : STATUS_CODE_TO_NAME[e.status]
    },
    status: e.status
  };
};
