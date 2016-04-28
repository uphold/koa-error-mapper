'use strict';

/**
 * Module dependencies.
 */

let mapper = require('../../mappers/fallback-error-mapper');
let should = require('should');

/**
 * Test `FallbackErrorMapper`.
 */

describe('FallbackErrorMapper', function() {
  it('should always return internal server error', function() {
    mapper.map().should.eql({ status: 500, body: { code: 'internal_server_error', message: 'Internal Server Error' }});
  });
});
