'use strict';

/**
 * Module dependencies.
 */

let ForbiddenError = require('../../util/forbidden-error');
let InvalidArgumentError = require('../../../lib/errors/invalid-argument-error');
let mapper = require('../../../lib/mappers/generic-error-mapper');
let should = require('should');

/**
 * Test `GenericErrorMapper`.
 */

describe('GenericErrorMapper', function() {
  it('should throw an error when mapping a non-error instance', function() {
    let result;

    try {
      result = mapper.map('foo');

      should.fail();
    } catch (e) {
      e.should.be.instanceOf(InvalidArgumentError);
      e.message.should.equal('Exception is not an instance of `Error`');
    }
  });

  it('should map typed errors without a custom status to internal server errors', function() {
    let result = mapper.map(new InvalidArgumentError('internal message with private content'));

    result.code.should.equal('internal_server_error');
    result.message.should.equal('Internal Server Error');
  });

  it('should map normal errors with a custom status and message to a standard http message', function() {
    let error = new Error('public message without any secrets');
    error.status = 403;

    let result = mapper.map(error);

    result.code.should.equal('forbidden');
    result.message.should.equal('Forbidden');
  });

  it('should map normal errors with a custom status only to a standard http message', function() {
    let error = new Error();
    error.status = 403;

    let result = mapper.map(error);

    result.code.should.equal('forbidden');
    result.message.should.equal('Forbidden');
  });

  it('should support typed errors with custom status and message', function() {
    let result = mapper.map(new ForbiddenError());

    result.code.should.equal('forbidden');
    result.message.should.equal('Forbidden');
  });
});
