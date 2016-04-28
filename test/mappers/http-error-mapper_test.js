'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('http-errors');
const mapper = require('../../mappers/http-error-mapper');
const should = require('should');

/**
 * Test `HttpErrorMapper`.
 */

describe('HttpErrorMapper', () => {
  it('should not map any error that is not an instance of `HttpError`', () => {
    should.not.exist(mapper.map({}));
  });

  it('should not expose the message error if `HttpError` does not have a status code set', () => {
    mapper.map(new HttpError('foo')).should.eql({ body: { code: 'internal_server_error', message: 'Internal Server Error' }, status: 500 });
  });

  it('should not expose the message error if `HttpError` does not have an exposable status code', () => {
    mapper.map(new HttpError(503, 'Foo')).should.eql({ body: { code: 'service_unavailable', message: 'Service Unavailable' }, status: 503 });
  });

  it('should return a regular http message if `HttpError` only has a status code set', () => {
    mapper.map(new HttpError(401)).should.eql({ body: { code: 'unauthorized', message: 'Unauthorized' }, status: 401 });
  });

  it('should return the error message if `HttpError` has an exposable status code and a message set', () => {
    mapper.map(new HttpError(401, 'Foo')).should.eql({ body: { code: 'unauthorized', message: 'Foo' }, status: 401 });
    mapper.map(new HttpError('Foo', 401)).should.eql({ body: { code: 'unauthorized', message: 'Foo' }, status: 401 });
  });
});
