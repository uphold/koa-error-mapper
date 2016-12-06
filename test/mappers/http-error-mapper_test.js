'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');
const httpErrorMapper = require('../../mappers/http-error-mapper');
const should = require('should');

/**
 * Test `HttpErrorMapper`.
 */

describe('HttpErrorMapper', () => {
  describe('when `HttpError` is not provided', () => {
    const mapper = httpErrorMapper();

    it('should not map any error that is not an instance of `HttpError`', () => {
      should.not.exist(mapper.map({}));
    });

    it('should return a regular http message if `HttpError` only has a status code set', () => {
      mapper.map(new HttpError(401)).should.eql({ body: { code: 'unauthorized', message: 'Unauthorized' }, headers: undefined, status: 401 });
    });

    it('should return `HttpError` message and its code in snake case format', () => {
      mapper.map(new HttpError(401, 'Foo Bar')).should.eql({ body: { code: 'foo_bar', message: 'Foo Bar' }, headers: undefined, status: 401 });
    });

    it('should return `HttpError` headers', () => {
      mapper.map(new HttpError(401, 'foo', { headers: { biz: 'baz' } })).should.eql({ body: { code: 'foo', message: 'foo' }, headers: { biz: 'baz' }, status: 401 });
    });
  });

  describe('when `HttpError` is provided', () => {
    const mapper = httpErrorMapper(HttpError);

    it('should not map any error that is not an instance of `HttpError`', () => {
      should.not.exist(mapper.map({}));
    });

    it('should return a regular http message if `HttpError` only has a status code set', () => {
      mapper.map(new HttpError(401)).should.eql({ body: { code: 'unauthorized', message: 'Unauthorized' }, headers: undefined, status: 401 });
    });

    it('should return `HttpError` message and its code in snake case format', () => {
      mapper.map(new HttpError(401, 'Foo Bar')).should.eql({ body: { code: 'foo_bar', message: 'Foo Bar' }, headers: undefined, status: 401 });
    });

    it('should return `HttpError` headers', () => {
      mapper.map(new HttpError(401, 'foo', { headers: { biz: 'baz' } })).should.eql({ body: { code: 'foo', message: 'foo' }, headers: { biz: 'baz' }, status: 401 });
    });
  });
});
