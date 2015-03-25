'use strict';

/**
 * Module dependencies.
 */

let HttpError = require('http-errors');
let mapper = require('../../mappers/http-error-mapper');
let should = require('should');

/**
 * Test `HttpErrorMapper`.
 */

describe('HttpErrorMapper', function() {
  it('should not map any error that is not an instance of `HttpError`', function() {
    should.not.exist(mapper.map({}));
  });

  it('should not expose the message error if `HttpError` does not have a status code set', function() {
    mapper.map(new HttpError('foo')).should.eql({ status: 500, body: { code: 'internal_server_error', message: 'Internal Server Error' }});
  });

  it('should not expose the message error if `HttpError` does not have an exposable status code', function() {
    mapper.map(new HttpError(503, 'Foo')).should.eql({ status: 503, body: { code: 'service_unavailable', message: 'Service Unavailable' }});
  });

  it('should return a regular http message if `HttpError` only has a status code set', function() {
    mapper.map(new HttpError(401)).should.eql({ status: 401, body: { code: 'unauthorized', message: 'Unauthorized' }});
  });

  it('should return the error message if `HttpError` has an exposable status code and a message set', function() {
    mapper.map(new HttpError(401, 'Foo')).should.eql({ status: 401, body: { code: 'unauthorized', message: 'Foo' }});
    mapper.map(new HttpError('Foo', 401)).should.eql({ status: 401, body: { code: 'unauthorized', message: 'Foo' }});
  });
});
