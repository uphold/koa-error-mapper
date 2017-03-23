# koa-error-mapper

`koa-error-mapper` is a middleware that handles application errors by mapping them to a custom format.

## Status

[![npm version][npm-image]][npm-url] [![build status][travis-image]][travis-url]

## Installation

Install the package via `yarn`:

```sh
❯ yarn add koa-error-mapper
```

or via `npm`:

```sh
❯ npm install koa-error-mapper --save
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
const Koa = require('koa');
const app = new Koa();
const customMapper = require('path/to/my/custom/mapper');

app.use(errorMapper([customMapper]);

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
❯ yarn test
```

## Release

```sh
❯ npm version [<new version> | major | minor | patch] -m "Release %s"
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/koa-error-mapper.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koa-error-mapper
[travis-image]: https://img.shields.io/travis/uphold/koa-error-mapper.svg?style=flat-square
[travis-url]: https://img.shields.io/travis/uphold/koa-error-mapper
