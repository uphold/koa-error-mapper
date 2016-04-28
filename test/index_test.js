'use strict';

/**
 * Module dependencies.
 */

let errorMapper = require('../');
let koa = require('koa');
let noop = function() {};
let request = require('co-supertest');
let util = require('util');

/**
 * Test `ErrorMapper` middleware.
 */

describe('ErrorMapper', function() {
  it('should return http error mapping if error is created using koa\'s `ctx.throw`', function *() {
    const app = koa();

    app.on('error', noop);

    app.use(errorMapper());
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
    const app = koa();

    app.on('error', noop);

    app.use(errorMapper());
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
    const app = koa();

    app.use(errorMapper());
    app.use(function *() {
      throw new CustomError();
    });

    yield request(app.listen())
      .get('/')
      .expect(500)
      .expect({ code: 'internal_server_error', message: 'Internal Server Error' })
      .end();
  });

  it('should return fallback error mapping if custom mappers are available but do not apply', function *() {
    const app = koa();

    function FooError() {}

    app.use(errorMapper([{
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
    const app = koa();

    app.on('error', noop);
    app.use(errorMapper([customErrorMapper]));

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
    const app = koa();
    let called = false;

    app.use(errorMapper([customErrorMapper, {
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

  it('should allow recovering from mapping errors', function *() {
    const app = koa();

    app.on('error', noop);

    app.use(errorMapper([{
      map: function(e) {
        if (e.message !== 'foobar') {
          return;
        }

        // Re-throw `Error` as `CustomError`.
        throw new CustomError(401, 'Foo');
      }
    }, customErrorMapper]));

    app.use(function *() {
      throw new Error('foobar');
    });

    yield request(app.listen())
      .get('/')
      .expect(401)
      .expect({ message: 'Foo' })
      .end();
  });

  it('should return headers of custom mapped errors if headers are available', function *() {
    const app = koa();

    app.use(errorMapper([{
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
    const app = koa();

    app.use(errorMapper());

    yield request(app.listen())
      .get('/')
      .expect(404)
      .expect({ code: 'not_found', message: 'Not Found' })
      .end();
  });

  it('should not emit an `error` event on app if mapping status is < 500', function *() {
    const app = koa();

    function HttpError(status) {
      this.status = status;
      this.expose = false;
    }

    HttpError.prototype.expose = function() {
      return this.expose;
    };

    HttpError.prototype.status = function() {
      return this.status;
    }

    HttpError.prototype.statusCode = function() {
      return this.status;
    }

    let called = false;

    app.on('error', function() {
      called = true;
    });

    app.use(errorMapper());
    app.use(function *() {
      throw new HttpError(429);
    });

    yield request(app.listen())
      .get('/')
      .expect(429)
      .expect(function() {
        called.should.be.false;
      })
      .end();
  });

  it('should emit an `error` event on app if mapping status is >= 500', function *() {
    const app = koa();
    let called = false;

    app.on('error', function() {
      called = true;
    });

    app.use(errorMapper());
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

const customErrorMapper = {
  map: function(e) {
    if (!(e instanceof CustomError)) {
      return;
    }

    return { status: e.code, body: { message: e.message }};
  }
};
