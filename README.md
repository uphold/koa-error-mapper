# koa-error-mapper

[![build status][travis-image]][travis-url]

`koa-error-mapper` is a middleware to handle and normalize application errors.

## Installation

```sh
npm install --save git+ssh://git@github.com/uphold/koa-error-mapper
```

## Usage

### Mappers

Mappers are responsible for handling errors and normalizing the response. A generic fallback mapper is included in case no custom mapper is available.

The only interface for a mapper is a `map()` function. A mapper should return `undefined` if it is not capable or responsible for mapping a specific error. It must return an object with `status` and `body`. If not returned on the object, the value on the response will be `undefined` for precaution. It may also contain a `headers` property.

```javascript
module.exports = {
  map(e) {
    if (!(e instanceof CustomError)) {
      return;
    }

    // Add your own custom logic here.
    return { status: e.code, body: { message: e.message }, headers: { Foo: 'Bar' }};
  }
};
```

Now use the error mapper and register `CustomMapper`:

```javascript
'use strict';

const CustomError = require('path/to/my/custom/error');
const CustomMapper = require('path/to/my/custom/mapper');
const Koa = require('koa');
const app = new Koa();

app.use(errorMapper([CustomMapper]);

app.get('/', async () => {
  throw new CustomError(401, 'Ah-ah!');
});

app.listen(3000);
```

Result:

```sh
GET /

HTTP/1.1 401 Unauthorized
Foo: Bar

{ "message": "Ah-ah!" }
```

## Tests

```sh
npm test
```

## Release

```sh
npm version [<newversion> | major | minor | patch] -m "Release %s"
```

## License

Private.

[travis-image]: https://magnum.travis-ci.com/uphold/koa-error-mapper.svg?token=dwsFqQ7vWTc2XyntMBxA&style=flat-square
[travis-url]: https://magnum.travis-ci.com/uphold/koa-error-mapper
