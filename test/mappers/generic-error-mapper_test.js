'use strict';

/**
 * Module dependencies.
 */

let mapper = require('../../mappers/generic-error-mapper');
let should = require('should');

/**
 * Test `GenericErrorMapper`.
 */

describe('GenericErrorMapper', function() {
  it('should not map any error that is not an instance of `Error`', function() {
    should.not.exist(mapper.map({}));
  });

  it('should return internal server error', function() {
    mapper.map(new Error('foo')).should.eql({ status: 500, body: { code: 'internal_server_error', message: 'Internal Server Error' }});
  });
});
