'use strict';

/**
 * Module dependencies.
 */

const createError = require('http-errors');
const mapper = require('../../mappers/http-error-mapper');

/**
 * Test `HttpErrorMapper`.
 */

describe('HttpErrorMapper', () => {
  it('should not map any error that is not an instance of `HttpError`', () => {
    expect(mapper.map({})).toBeUndefined();
  });

  it('should not expose the message error if `HttpError` does not have a status code set', () => {
    expect(mapper.map(createError(undefined, 'foo'))).toEqual({
      body: { code: 'internal_server_error', message: 'Internal Server Error' },
      status: 500
    });
  });

  it('should not expose the message error if `HttpError` does not have an exposable status code', () => {
    expect(mapper.map(createError(503, 'Foo'))).toEqual({
      body: { code: 'service_unavailable', message: 'Service Unavailable' },
      status: 503
    });
  });

  it('should return a regular http message if `HttpError` only has a status code set', () => {
    expect(mapper.map(createError(401))).toEqual({
      body: { code: 'unauthorized', message: 'Unauthorized' },
      status: 401
    });
  });

  it('should return the error message if `HttpError` has an exposable status code and a message set', () => {
    expect(mapper.map(createError(401, 'Foo'))).toEqual({
      body: { code: 'unauthorized', message: 'Foo' },
      status: 401
    });
  });
});
