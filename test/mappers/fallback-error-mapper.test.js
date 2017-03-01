'use strict';

/**
 * Module dependencies.
 */

const mapper = require('../../mappers/fallback-error-mapper');

/**
 * Test `FallbackErrorMapper`.
 */

describe('FallbackErrorMapper', () => {
  it('should always return internal server error', () => {
    expect(mapper.map()).toEqual({ body: { code: 'internal_server_error', message: 'Internal Server Error' }, status: 500 });
  });
});
