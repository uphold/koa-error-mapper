# Koa Error Handler

[![build status][travis-image]][travis-url]

Koa Error Handler is a middleware to handle and normalize your application errors.

## Installation

* Download: [koa-error-handler](https://github.com/bitreserve/koa-error-handler)

## Mappers

Mappers will be responsible for handling errors and normalize the response.
We provide a generic one that will handle every error the same way but you can add others to better fit your needs. You can achieve this by passing and object as argument with `key` being the error name and the `value` being the mapper responsible to handle it.

```js
module.exports = {
  map: function(error) {
    // Handle the error here.
  	
    return { code: 'custom_code', error: 'Custom Error' };
  }
};
```
### Requirements

Every mapper must have a `map` method which will receive the error and will only be called when the `error name` matches your configuration. The return value of your mapper will be assigned to the body.

## Usage

```js
var CustomError = require('path/to/my/custom/error');
var CustomMapper = require('path/to/my/custom/mapper');
var koa = require('koa');

var app = koa();

app.use(errorHandler({
  CustomError: CustomMapper
}));

app.get('/', function *() {
  throw new CustomError();
});

app.listen(3000);
```

### Result

```bash
> GET /

{ code: 'custom_code', error: 'Custom Error' }
```

## Running tests

```sh
npm test
```

[travis-image]: https://magnum.travis-ci.com/bitreserve/koa-error-handler.svg?token=dwsFqQ7vWTc2XyntMBxA&style=flat-square
[travis-url]: https://magnum.travis-ci.com/bitreserve/koa-error-handler
