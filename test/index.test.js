'use strict';

/**
 * Module dependencies.
 */

const Koa = require('koa');
const errorMapper = require('../');
const request = require('supertest');
const util = require('util');

/**
 * Noop function.
 */

function noop() {}

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

const customErrorMapper = {
  map(e) {
    if (!(e instanceof CustomError)) {
      return;
    }

    return { body: { message: e.message }, status: e.code };
  }
};

/**
 * Test `ErrorMapper` middleware.
 */

describe('ErrorMapper', () => {
  let app;
  let server;

  beforeEach(() => {
    app = new Koa();

    app.on('error', noop);

    server = app.listen();
  });

  afterEach(() => {
    server.close();
  });

  it('should return http error mapping if error is created using koa\'s `ctx.throw`', () => {
    app.use(errorMapper());
    app.use(async ctx => {
      ctx.throw(403);
    });

    return request(server)
      .get('/')
      .expect(403)
      .expect({ code: 'forbidden', message: 'Forbidden' });
  });

  it('should return generic mapping if no custom mapper is available', () => {
    app.use(errorMapper());
    app.use(async () => {
      throw new Error();
    });

    return request(server)
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' });
  });

  it('should return generic mapping if error is subclassed and no custom mapper is available', () => {
    app.use(errorMapper());
    app.use(async () => {
      throw new CustomError();
    });

    return request(server)
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' });
  });

  it('should return fallback error mapping if custom mappers are available but do not apply', () => {
    function FooError() {}

    app.use(errorMapper([{
      map(e) {
        if (!(e instanceof FooError)) {
          return;
        }
      }
    }]));

    app.use(async () => {
      throw new CustomError(401, 'Foo');
    });

    return request(server)
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' });
  });

  it('should return custom mapping if a custom `mapper` is available', () => {
    app.use(errorMapper([customErrorMapper]));

    app.use(async () => {
      throw new CustomError(401, 'Foo');
    });

    return request(server)
      .get('/')
      .expect(401)
      .expect({ message: 'Foo' });
  });

  it('should return the first custom mapping available', () => {
    let called = false;

    app.use(errorMapper([customErrorMapper, {
      map() {
        called = true;
      }
    }]));

    app.use(async () => {
      throw new CustomError(401, 'Foo');
    });

    return request(server)
      .get('/')
      .expect(401)
      .expect({ message: 'Foo' })
      .expect(() => {
        expect(called).toBe(false);
      });
  });

  it('should allow recovering from mapping errors', () => {
    app.use(errorMapper([{
      map(e) {
        if (e.message !== 'foobar') {
          return;
        }

        // Re-throw `Error` as `CustomError`.
        throw new CustomError(401, 'Foo');
      }
    }, customErrorMapper]));

    app.use(async () => {
      throw new Error('foobar');
    });

    return request(server)
      .get('/')
      .expect(401)
      .expect({ message: 'Foo' });
  });

  it('should return headers of custom mapped errors if headers are available', () => {
    app.use(errorMapper([{
      map(e) {
        if (!(e instanceof CustomError)) {
          return;
        }

        return { headers: { Foo: 'Bar' }, status: e.code };
      }
    }]));

    app.use(async () => {
      throw new CustomError(401);
    });

    return request(server)
      .get('/')
      .expect('Foo', 'Bar')
      .expect(401);
  });

  it('should return mapped `not_found` error by default', () => {
    app.use(errorMapper());

    return request(server)
      .get('/')
      .expect(404)
      .expect({ code: 'not_found', message: 'Not Found' });
  });

  it('should emit an `error` event on app', () => {
    let called = false;

    app.on('error', () => {
      called = true;
    });

    app.use(errorMapper());
    app.use(async () => {
      throw new Error();
    });

    return request(server)
      .get('/')
      .expect(500)
      .expect(() => {
        expect(called).toBe(true);
      });
  });
});
