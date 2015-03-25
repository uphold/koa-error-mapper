'use strict';

/**
 * Module dependencies.
 */

let errorHandler = require('../');
let koa = require('koa');
let request = require('co-supertest');
let noop = function() {};
let util = require('util');

/**
 * Test `ErrorHandler` middleware.
 */

describe('ErrorHandler', function() {
  it('should return http error mapping if error is created using koa\'s `ctx.throw`', function *() {
    let app = koa();

    app.on('error', noop);
    app.use(errorHandler());
    app.use(function *() {
      this.throw(403);
    });

    yield request(app.listen())
      .get('/')
      .expect(403)
      .expect({ code: 'forbidden', message: 'Forbidden' })
      .end();
  });

  it('should return generic mapping if no custom mapper is available', function *() {
    let app = koa();

    app.on('error', noop);
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

  it('should return generic mapping if error is subclassed and no custom mapper is available', function *() {
    let app = koa();

    app.on('error', noop);
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

  it('should return generic mapping as a fallback if custom mappers are available but do not apply', function *() {
    let app = koa();

    function FooError() {}

    app.on('error', noop);
    app.use(errorHandler([{
      map: function(e) {
        if (!(e instanceof FooError)) {
          return;
        }
      }
    }]));

    app.use(function *() {
      throw new CustomError(401, 'Foo');
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' })
      .end();
  });

  it('should return custom mapping if a custom `mapper` is available', function *() {
    let app = koa();

    app.on('error', noop);
    app.use(errorHandler([customErrorMapper()]));

    app.use(function *() {
      throw new CustomError(401, 'Foo');
    });

    yield request(app.listen())
      .get('/')
      .expect(401)
      .expect({ message: 'Foo' })
      .end();
  });

  it('should return the first custom mapping available', function *() {
    let app = koa();
    let called = false;

    app.on('error', noop);
    app.use(errorHandler([customErrorMapper(), {
      map: function(e) {
        called = true;
      }
    }]));

    app.use(function *() {
      throw new CustomError(401, 'Foo');
    });

    yield request(app.listen())
      .get('/')
      .expect(401)
      .expect({ message: 'Foo' })
      .expect(function() {
        called.should.be.false;
      })
      .end();
  });

  it('should return headers of custom mapped errors if headers are available', function *() {
    let app = koa();

    app.on('error', noop);
    app.use(errorHandler([{
      map: function(e) {
        if (!(e instanceof CustomError)) {
          return;
        }

        return { status: e.code, headers: { Foo: 'Bar' }};
      }
    }]));

    app.use(function *() {
      throw new CustomError(401);
    });

    yield request(app.listen())
      .get('/')
      .expect('Foo', 'Bar')
      .expect(401)
      .end();
  });

  it('should return mapped `not_found` error by default', function *() {
    let app = koa();

    app.on('error', noop);
    app.use(errorHandler());

    yield request(app.listen())
      .get('/')
      .expect(404)
      .expect({ code: 'not_found', message: 'Not Found' })
      .end();
  });

  it('should emit an `error` event on app', function *() {
    let app = koa();
    let called = false;

    app.on('error', function() {
      called = true;
    });

    app.use(errorHandler());
    app.use(function *() {
      throw new Error();
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect(function() {
        called.should.be.true;
      })
      .end();
  });
});

/**
 * `CustomError` constructor.
 */

function CustomError(code, message) {
  Error.call(this);

  this.code = code;
  this.message = message;
}

/**
 * Inherit from `Error`.
 */

util.inherits(CustomError, Error);

/**
 * Mapper for `CustomError`.
 */

function customErrorMapper() {
  return {
    map: function(e) {
      if (!(e instanceof CustomError)) {
        return;
      }

      return { status: e.code, body: { message: e.message }};
    }
  };
}
