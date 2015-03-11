'use strict';

/**
 * Module dependencies.
 */

require('backend-tools/test/util/sinon');

let CustomError = require('./util/custom-error');
let CustomMapper = require('./util/custom-mapper');
let errorHandler = require('../');
let koa = require('koa');
let request = require('backend-tools/test/util/request')();

/**
 * Test `ErrorHandler`.
 */

describe('ErrorHandler', function() {
  it('should map a generic error to an error 500', function *() {
    let app = koa();

    app.use(errorHandler());

    app.use(function *() {
      throw new Error();
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' })
      .end();
  });

  it('should emit an `error` event on app', function *() {
    let app = koa();
    let error = this.sinon.spy();

    app.use(errorHandler());

    app.use(function *() {
      throw new Error();
    });

    app.on('error', function() {
      error();
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect(function() {
        error.callCount.should.equal(1);
      })
      .end();
  });

  it('should map a generic error by default', function *() {
    let app = koa();

    app.use(errorHandler());

    app.use(function *() {
      throw new CustomError();
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' })
      .end();
  });

  it('should accept a `mappers` object as argument', function *() {
    let app = koa();

    app.use(errorHandler({
      CustomError: CustomMapper
    }));

    app.use(function *() {
      throw new CustomError();
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect({ code: 'custom_code', error: 'Custom Error' })
      .end();
  });
});
