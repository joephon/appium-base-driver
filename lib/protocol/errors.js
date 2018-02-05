import ES6Error from 'es6-error';
import _ from 'lodash';
import { util, logger } from 'appium-support';
import HTTPStatusCodes from 'http-status-codes';

const mjsonwpLog = logger.getLogger('MJSONWP');
const w3cLog = logger.getLogger('W3C');

// base error class for all of our errors
class ProtocolError extends ES6Error {
  constructor (msg, jsonwpCode, w3cStatus, error) {
    super(msg);
    this.jsonwpCode = jsonwpCode;
    this.error = error || 'An unknown error has occurred';
    if (this.jsonwpCode === null) {
      this.jsonwpCode = 13;
    }
    this.w3cStatus = w3cStatus || HTTPStatusCodes.BAD_REQUEST;
  }
}

class NoSuchDriverError extends ProtocolError {
  static code () {
    return 6;
  }
  // W3C Error is called InvalidSessionID
  static w3cStatus () {
    return HTTPStatusCodes.NOT_FOUND;
  }
  static error () {
    return 'invalid session id';
  }
  constructor (err) {
    super(err || 'A session is either terminated or not started', NoSuchDriverError.code(), NoSuchDriverError.w3cStatus(), NoSuchDriverError.error());
  }
}


class NoSuchElementError extends ProtocolError {
  static code () {
    return 7;
  }
  static w3cStatus () {
    return HTTPStatusCodes.NOT_FOUND;
  }
  static error () {
    return 'no such element';
  }
  constructor (err) {
    super(err || 'An element could not be located on the page using the given ' +
          'search parameters.', NoSuchElementError.code(), NoSuchElementError.w3cStatus(), NoSuchElementError.error());
  }
}

class NoSuchFrameError extends ProtocolError {
  static code () {
    return 8;
  }
  static error () {
    return 'no such frame';
  }
  constructor (err) {
    super(err || 'A request to switch to a frame could not be satisfied because ' +
          'the frame could not be found.', NoSuchFrameError.code(), null, NoSuchFrameError.error());
  }
}

class UnknownCommandError extends ProtocolError {
  static code () {
    return 9;
  }
  static w3cStatus () {
    return HTTPStatusCodes.NOT_FOUND;
  }
  static error () {
    return 'unknown command';
  }
  constructor (err) {
    super(err || 'The requested resource could not be found, or a request was ' +
          'received using an HTTP method that is not supported by the mapped ' +
          'resource.', UnknownCommandError.code(), UnknownCommandError.w3cStatus(), UnknownCommandError.error());
  }
}

class StaleElementReferenceError extends ProtocolError {
  static code () {
    return 10;
  }
  static error () {
    return 'stale element reference';
  }
  constructor (err) {
    super(err || 'An element command failed because the referenced element is no ' +
          'longer attached to the DOM.', StaleElementReferenceError.code(), null, StaleElementReferenceError.error());
  }
}

class ElementNotVisibleError extends ProtocolError {
  static code () {
    return 11;
  }
  constructor (err) {
    super(err || 'An element command could not be completed because the element is ' +
          'not visible on the page.', ElementNotVisibleError.code());
  }
}

class InvalidElementStateError extends ProtocolError {
  static code () {
    return 12;
  }
  static error () {
    return 'invalid element state';
  }
  constructor (err) {
    super(err || 'An element command could not be completed because the element is ' +
          'in an invalid state (e.g. attempting to click a disabled element).',
          InvalidElementStateError.code(), null, InvalidElementStateError.error());
  }
}

class UnknownError extends ProtocolError {
  static code () {
    return 13;
  }
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'unknown error';
  }
  constructor (originalError) {
    let origMessage = originalError;
    if (originalError instanceof Error) {
      origMessage = originalError.message;
    }
    let message = 'An unknown server-side error occurred while processing ' +
                  'the command.';
    if (originalError) {
      message = `${message} Original error: ${origMessage}`;
    }

    super(message, UnknownError.code(), UnknownError.w3cStatus(), UnknownError.error());
  }
}

class UnknownMethodError extends ProtocolError {
  static w3cStatus () {
    return HTTPStatusCodes.METHOD_NOT_ALLOWED;
  }
  static error () {
    return 'unknown method';
  }
  constructor (err) {
    super(err || 'The requested command matched a known URL but did not match an method for that URL', null, UnknownMethodError.w3cStatus(), UnknownMethodError.error());
  }
}

class UnsupportedOperationError extends ProtocolError {
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'unsupported operation';
  }
  constructor (err) {
    super(err || 'A server-side error occurred. Command cannot be supported.',
      null, UnsupportedOperationError.w3cStatus(), UnsupportedOperationError.error());
  }
}

class ElementIsNotSelectableError extends ProtocolError {
  static code () {
    return 15;
  }
  static error () {
    return 'element not selectable';
  }
  constructor (err) {
    super(err || 'An attempt was made to select an element that cannot be selected.',
          ElementIsNotSelectableError.code(), null, ElementIsNotSelectableError.error());
  }
}

class ElementClickInterceptedError extends ProtocolError {
  static error () {
    return 'element click intercepted';
  }
  constructor (err) {
    super(err || 'The Element Click command could not be completed because the element receiving the events is obscuring the element that was requested clicked', ElementIsNotSelectableError.code(), null, ElementClickInterceptedError.error());
  }
}

class ElementNotInteractableError extends ProtocolError {
  static error () {
    return 'element not interactable';
  }
  constructor (err) {
    super(err || 'A command could not be completed because the element is not pointer- or keyboard interactable', ElementIsNotSelectableError.code(), null, ElementNotInteractableError.error());
  }
}

class InsecureCertificateError extends ProtocolError {
  static error () {
    return 'insecure certificate';
  }
  constructor (err) {
    super(err || 'Navigation caused the user agent to hit a certificate warning, which is usually the result of an expired or invalid TLS certificate', ElementIsNotSelectableError.code(), null, InsecureCertificateError.error());
  }
}

class JavaScriptError extends ProtocolError {
  static code () {
    return 17;
  }
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'javascript error';
  }
  constructor (err) {
    super(err || 'An error occurred while executing user supplied JavaScript.',
          JavaScriptError.code(), JavaScriptError.w3cStatus(), JavaScriptError.error());
  }
}

class XPathLookupError extends ProtocolError {
  static code () {
    return 19;
  }
  constructor (err) {
    super(err || 'An error occurred while searching for an element by XPath.',
          XPathLookupError.code());
  }
}

class TimeoutError extends ProtocolError {
  static code () {
    return 21;
  }
  static w3cStatus () {
    return HTTPStatusCodes.REQUEST_TIMEOUT;
  }
  static error () {
    return 'timeout';
  }
  constructor (err) {
    super(err || 'An operation did not complete before its timeout expired.',
          TimeoutError.code(), TimeoutError.w3cStatus(), TimeoutError.error());
  }
}

class NoSuchWindowError extends ProtocolError {
  static code () {
    return 23;
  }
  static error () {
    return 'no such window';
  }
  constructor (err) {
    super(err || 'A request to switch to a different window could not be satisfied ' +
          'because the window could not be found.', NoSuchWindowError.code(), null, NoSuchWindowError.error());
  }
}

class InvalidArgumentError extends ProtocolError {
  static error () {
    return 'invalid argument';
  }
  constructor (err) {
    super(err || 'The arguments passed to the command are either invalid or malformed', null, null, BadParametersError.error());
  }
}

class InvalidCookieDomainError extends ProtocolError {
  static code () {
    return 24;
  }
  static error () {
    return 'invalid cookie domain';
  }
  constructor (err) {
    super(err || 'An illegal attempt was made to set a cookie under a different ' +
          'domain than the current page.', InvalidCookieDomainError.code(), null, InvalidCookieDomainError.error());
  }
}

class InvalidCoordinatesError extends ProtocolError {
  static error () {
    return 'invalid coordinates';
  }
  constructor (err) {
    super(err || 'The coordinates provided to an interactions operation are invalid', ElementIsNotSelectableError.code(), null, InvalidCoordinatesError.error());
  }
}

class NoSuchCookieError extends ProtocolError {
  static w3cStatus () {
    return HTTPStatusCodes.NOT_FOUND;
  }
  static error () {
    return 'no such cookie';
  }
  constructor (err) {
    super(err || 'No cookie matching the given path name was found amongst the associated cookies of the current browsing context’s active document', null, NoSuchCookieError.w3cStatus(), NoSuchCookieError.error());
  }
}

class UnableToSetCookieError extends ProtocolError {
  static code () {
    return 25;
  }
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'unable to set cookie';
  }
  constructor (err) {
    super(err || 'A request to set a cookie\'s value could not be satisfied.',
          UnableToSetCookieError.code(), UnableToSetCookieError.w3cStatus(), UnableToSetCookieError.error());
  }
}

class UnexpectedAlertOpenError extends ProtocolError {
  static code () {
    return 26;
  }
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'unexpected alert open';
  }
  constructor (err) {
    super(err || 'A modal dialog was open, blocking this operation',
          UnexpectedAlertOpenError.code(), UnexpectedAlertOpenError.w3cStatus(), UnexpectedAlertOpenError.error());
  }
}

class NoAlertOpenError extends ProtocolError {
  static code () {
    return 27;
  }
  constructor (err) {
    super(err || 'An attempt was made to operate on a modal dialog when one ' +
          'was not open.', NoAlertOpenError.code());
  }
}

class ScriptTimeoutError extends ProtocolError {
  static code () {
    return 28;
  }
  static w3cStatus () {
    return HTTPStatusCodes.REQUEST_TIMEOUT;
  }
  static error () {
    return 'script timeout';
  }
  constructor (err) {
    super(err || 'A script did not complete before its timeout expired.',
          ScriptTimeoutError.code(), ScriptTimeoutError.w3cStatus(), ScriptTimeoutError.error());
  }
}

class InvalidElementCoordinatesError extends ProtocolError {
  static code () {
    return 29;
  }
  constructor (err) {
    super(err || 'The coordinates provided to an interactions operation are invalid.',
          InvalidElementCoordinatesError.code());
  }
}

class IMENotAvailableError extends ProtocolError {
  static code () {
    return 30;
  }
  constructor (err) {
    super(err || 'IME was not available.', IMENotAvailableError.code());
  }
}

class IMEEngineActivationFailedError extends ProtocolError {
  static code () {
    return 31;
  }
  constructor (err) {
    super(err || 'An IME engine could not be started.',
          IMEEngineActivationFailedError.code());
  }
}

class InvalidSelectorError extends ProtocolError {
  static code () {
    return 32;
  }
  static error () {
    return 'invalid selector';
  }
  constructor (err) {
    super(err || 'Argument was an invalid selector (e.g. XPath/CSS).',
          InvalidSelectorError.code(), null, InvalidSelectorError.error());
  }
}

class SessionNotCreatedError extends ProtocolError {
  static code () {
    return 33;
  }
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'session not created';
  }
  constructor (details) {
    let message = 'A new session could not be created.';
    if (details) {
      message += ` Details: ${details}`;
    }

    super(message, SessionNotCreatedError.code(), SessionNotCreatedError.w3cStatus(), SessionNotCreatedError.error());
  }
}

class MoveTargetOutOfBoundsError extends ProtocolError {
  static code () {
    return 34;
  }
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'move target out of bounds';
  }
  constructor (err) {
    super(err || 'Target provided for a move action is out of bounds.',
          MoveTargetOutOfBoundsError.code(), MoveTargetOutOfBoundsError.w3cStatus(), MoveTargetOutOfBoundsError.error());
  }
}

class NoSuchAlertError extends ProtocolError {
  static error () {
    return 'no such alert';
  }
  constructor (err) {
    super(err || 'The target for mouse interaction is not in the browser’s viewport and cannot be brought into that viewport', null, null, NoSuchAlertError.error());
  }
}

class NoSuchContextError extends ProtocolError {
  static code () {
    return 35;
  }
  constructor (err) {
    super(err || 'No such context found.', NoSuchContextError.code());
  }
}

class InvalidContextError extends ProtocolError {
  static code () {
    return 36;
  }
  constructor (err) {
    super(err || 'That command could not be executed in the current context.',
          InvalidContextError.code());
  }
}

// This is an alias for UnknownMethodError
class NotYetImplementedError extends ProtocolError {
  static code () {
    return 13;
  }
  static w3cStatus () {
    return HTTPStatusCodes.NOT_FOUND; // W3C equivalent is called 'Unknown Command' (A command could not be executed because the remote end is not aware of it)
  }
  static error () {
    return 'unknown method';
  }
  constructor (err) {
    super(err || 'Method has not yet been implemented',
      NotYetImplementedError.code(), NotYetImplementedError.w3cStatus(), NotYetImplementedError.error());
  }
}

class NotImplementedError extends ProtocolError {
  static code () {
    return 13;
  }
  static w3cStatus () {
    return HTTPStatusCodes.METHOD_NOT_ALLOWED; // W3C equivalent is 'Unknown Method' (The requested command matched a known URL but did not match an method for that URL)
  }
  constructor (err) {
    super(err || 'Method is not implemented', NotImplementedError.code());
  }
}

class UnableToCaptureScreen extends ProtocolError {
  static w3cStatus () {
    return HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  }
  static error () {
    return 'unable to capture screen';
  }
  constructor (err) {
    super(err || 'A screen capture was made impossible', null, UnableToCaptureScreen.w3cStatus(), UnableToCaptureScreen.error());
  }
}


// Equivalent to W3C InvalidArgumentError
class BadParametersError extends ES6Error {
  static error () {
    return 'invalid argument';
  }
  constructor (requiredParams, actualParams, errMessage) {
    let message;
    if (!errMessage) {
      message = `Parameters were incorrect. We wanted ` +
          `${JSON.stringify(requiredParams)} and you ` +
          `sent ${JSON.stringify(actualParams)}`;
    } else {
      message = `Parameters were incorrect. You sent ${JSON.stringify(actualParams)}, ${errMessage}`;
    }
    super(message);
    this.w3cStatus = HTTPStatusCodes.BAD_REQUEST;
  }
}

/**
 * ProxyRequestError is a custom error and will be thrown up on unsuccessful proxy request and
 * will contain information about the proxy failure.
 * In case of ProxyRequestError should fetch the actual error by calling `getActualError()`
 * for proxy failure to generate the client response.
 */
class ProxyRequestError extends ES6Error {
  constructor (err, responseError, httpStatus) {
    let origMessage = '';
    if (util.hasValue(responseError)) {
      if (_.isString(responseError.value)) {
        origMessage = responseError.value;
      } else if (_.isPlainObject(responseError.value) && _.isString(responseError.value.message)) {
        origMessage = responseError.value.message;
      }
    }
    let message = `Proxy request unsuccessful. ${origMessage}`;
    super(err || message);

    this.w3cStatus = HTTPStatusCodes.BAD_REQUEST;
    if (_.isString(responseError)) {
      this.jsonwp = JSON.parse(responseError);
    } else {
      if (_.isPlainObject(responseError) && _.isPlainObject(responseError.value)) {
        this.w3c = responseError.value;
        this.w3cStatus = httpStatus || HTTPStatusCodes.BAD_REQUEST;
      } else {
        this.jsonwp = responseError;
      }
    }
  }

  getActualError () {
    // If it's MJSONWP error, returns actual error cause for request failure based on `jsonwp.status`
    if (util.hasValue(this.jsonwp) && util.hasValue(this.jsonwp.status) && util.hasValue(this.jsonwp.value)) {
      return errorFromMJSONWPStatusCode(this.jsonwp.status, this.jsonwp.value);
    } else if (util.hasValue(this.w3c) && _.isNumber(this.w3cStatus) && this.w3cStatus >= 300) {
      return errorFromW3CJsonCode(this.w3c.error, this.message);
    }
    return new UnknownError(this.message);
  }
}
// map of error class name to error class
const errors = {NotYetImplementedError,
                NotImplementedError,
                BadParametersError,
                InvalidArgumentError,
                NoSuchDriverError,
                NoSuchElementError,
                UnknownCommandError,
                StaleElementReferenceError,
                ElementNotVisibleError,
                InvalidElementStateError,
                UnknownError,
                ElementIsNotSelectableError,
                ElementClickInterceptedError,
                ElementNotInteractableError,
                InsecureCertificateError,
                JavaScriptError,
                XPathLookupError,
                TimeoutError,
                NoSuchWindowError,
                NoSuchCookieError,
                InvalidCookieDomainError,
                InvalidCoordinatesError,
                UnableToSetCookieError,
                UnexpectedAlertOpenError,
                NoAlertOpenError,
                ScriptTimeoutError,
                InvalidElementCoordinatesError,
                IMENotAvailableError,
                IMEEngineActivationFailedError,
                InvalidSelectorError,
                SessionNotCreatedError,
                MoveTargetOutOfBoundsError,
                NoSuchAlertError,
                NoSuchContextError,
                InvalidContextError,
                NoSuchFrameError,
                UnableToCaptureScreen,
                UnknownMethodError,
                UnsupportedOperationError,
                ProxyRequestError};

// map of error code to error class
const jsonwpErrorCodeMap = {};
for (let ErrorClass of _.values(errors)) {
  if (ErrorClass.code) {
    jsonwpErrorCodeMap[ErrorClass.code()] = ErrorClass;
  }
}

const w3cErrorCodeMap = {};
for (let ErrorClass of _.values(errors)) {
  if (ErrorClass.error) {
    w3cErrorCodeMap[ErrorClass.error()] = ErrorClass;
  }
}



function isErrorType (err, type) {
  // `name` property is the constructor name
  if (type.name === ProtocolError.name) {
    // `jsonwpCode` is `0` on success
    return !!err.jsonwpCode;
  } else if (type.name === ProxyRequestError.name) {
    // `status` is `0` on success
    if (err.jsonwp) {
      return !!err.jsonwp.status;
    }

    if (_.isPlainObject(err.w3c)) {
      return _.isNumber(err.w3cStatus) && err.w3cStatus >= 300;
    }

    return false;
  }
  return err.constructor.name === type.name;
}

/**
 * Retrieve an error derived from MJSONWP status
 * @param {number} code JSONWP status code
 * @param {string} message The error message
 * @return {ProtocolError} The error that is associated with provided JSONWP status code
 */
function errorFromMJSONWPStatusCode (code, message) {
  if (code !== UnknownError.code() && jsonwpErrorCodeMap[code]) {
    return new jsonwpErrorCodeMap[code](message);
  }
  return new UnknownError(message);
}

/**
 * Retrieve an error derived from W3C JSON Code
 * @param {string} code W3C error string (see https://www.w3.org/TR/webdriver/#handling-errors `JSON Error Code` column)
 * @param {string} the error message
 * @return {ProtocolError}  The error that is associated with the W3C error string
 */
function errorFromW3CJsonCode (code, message) {
  if (code && w3cErrorCodeMap[code.toLowerCase()]) {
    return new w3cErrorCodeMap[code.toLowerCase()](message);
  }
  return new UnknownError(message);
}

function getResponseForW3CError (err) {
  let httpStatus;
  let error;
  if (!err.w3cStatus) {
    w3cLog.error(`Encountered internal error running command: ${err.stack}`);
    err = new errors.UnknownError(err.message);
  }

  if (isErrorType(err, errors.BadParametersError)) {
    // respond with a 400 if we have bad parameters
    w3cLog.debug(`Bad parameters: ${err}`);
    error = BadParametersError.error();
  } else {
    error = err.error;
  }

  httpStatus = err.w3cStatus;

  let httpResBody = {
    value: {
      error,
      message: err.message,
      stacktrace: err.stack,
    }
  };
  return [httpStatus, httpResBody];
}

function getResponseForJsonwpError (err) {
  let httpStatus = HTTPStatusCodes.INTERNAL_SERVER_ERROR;
  let httpResBody = {
    status: err.jsonwpCode,
    value: {
      message: err.message
    }
  };

  if (isErrorType(err, errors.BadParametersError)) {
    // respond with a 400 if we have bad parameters
    mjsonwpLog.debug(`Bad parameters: ${err}`);
    httpStatus = HTTPStatusCodes.BAD_REQUEST;
    httpResBody = err.message;
  } else if (isErrorType(err, errors.NotYetImplementedError) ||
             isErrorType(err, errors.NotImplementedError)) {
    // respond with a 501 if the method is not implemented
    httpStatus = HTTPStatusCodes.NOT_IMPLEMENTED;
  } else if (isErrorType(err, errors.NoSuchDriverError)) {
    // respond with a 404 if there is no driver for the session
    httpStatus = HTTPStatusCodes.NOT_FOUND;
  }


  return [httpStatus, httpResBody];
}

export { ProtocolError, errors, isErrorType, errorFromMJSONWPStatusCode, errorFromW3CJsonCode, getResponseForW3CError, getResponseForJsonwpError };