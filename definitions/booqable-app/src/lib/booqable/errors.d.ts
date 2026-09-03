import { RateLimit } from './rate-limit.js';
/** The pieces of an HTTP exchange an error is built from. */
export interface ErrorResponse {
    status: number;
    headers?: Headers | Record<string, string>;
    body?: string;
    url?: string;
    method?: string;
    /** The request body, used to classify OAuth invalid_grant errors. */
    requestBody?: string;
}
/**
 * Base error for all Booqable API errors.
 *
 * Mirrors Booqable::Error from booqable.rb: carries the response status,
 * headers, and body, plus parsed JSON:API validation errors when present.
 */
export declare class BooqableError extends Error {
    /** Rate limit information, populated for rate-limited errors. */
    context: RateLimit | null;
    readonly response: ErrorResponse;
    constructor(response: ErrorResponse);
    /** Status code returned by the Booqable server. */
    get responseStatus(): number;
    /** Headers returned by the Booqable server. */
    get responseHeaders(): Headers | Record<string, string> | undefined;
    /** Body returned by the Booqable server. */
    get responseBody(): string | undefined;
    /** Validation errors from the JSON:API error document, if any. */
    get errors(): any[];
}
/** Raised on errors in the 400-499 range. */
export declare class ClientError extends BooqableError {
}
/** Raised when Booqable returns a 400 HTTP status code. */
export declare class BadRequest extends ClientError {
}
/** 400 with a body matching 'unwrittable_attribute'. */
export declare class ReadOnlyAttribute extends ClientError {
}
/** 400 with a body matching 'unknown_attribute'. */
export declare class UnknownAttribute extends ClientError {
}
/** 400 with a body matching 'fields should be an object'. */
export declare class FieldsInWrongFormat extends ClientError {
}
/** 400 with a body matching 'extra fields should be an object'. */
export declare class ExtraFieldsInWrongFormat extends ClientError {
}
/** 400 with a body matching 'page should be an object'. */
export declare class PageShouldBeAnObject extends ClientError {
}
/** 400 with a body matching 'failed typecasting'. */
export declare class FailedTypecasting extends ClientError {
}
/** 400 with a body matching 'invalid filter'. */
export declare class InvalidFilter extends ClientError {
}
/** 400 with a body matching 'required filter'. */
export declare class RequiredFilter extends ClientError {
}
/** 401 with a body matching 'token is invalid (revoked)'. */
export declare class TokenRevoked extends ClientError {
}
/** 400 invalid_grant where the grant type is refresh_token (OAuth error). */
export declare class RefreshTokenRevoked extends TokenRevoked {
}
/** 400 invalid_grant where the grant type is not refresh_token (OAuth error). */
export declare class InvalidGrant extends ClientError {
}
/** Raised when Booqable returns a 401 HTTP status code. */
export declare class Unauthorized extends ClientError {
}
/** Raised when Booqable returns a 402 HTTP status code. */
export declare class PaymentRequired extends ClientError {
}
/** 402 with a body matching 'feature_not_enabled'. */
export declare class FeatureNotEnabled extends PaymentRequired {
}
/** 402 with a body matching 'trial_expired'. */
export declare class TrialExpired extends PaymentRequired {
}
/** Raised when Booqable returns a 403 HTTP status code. */
export declare class Forbidden extends ClientError {
}
/** Raised when Booqable returns a 429 HTTP status code (rate limited). */
export declare class TooManyRequests extends Forbidden {
}
/** Raised when Booqable returns a 404 HTTP status code. */
export declare class NotFound extends ClientError {
}
/** 404 with a body matching 'company not found'. */
export declare class CompanyNotFound extends NotFound {
}
/** Raised when Booqable returns a 405 HTTP status code. */
export declare class MethodNotAllowed extends ClientError {
}
/** Raised when Booqable returns a 406 HTTP status code. */
export declare class NotAcceptable extends ClientError {
}
/** Raised when Booqable returns a 409 HTTP status code. */
export declare class Conflict extends ClientError {
}
/** Raised when Booqable returns a 410 HTTP status code. */
export declare class Deprecated extends ClientError {
}
/** Raised when Booqable returns a 415 HTTP status code. */
export declare class UnsupportedMediaType extends ClientError {
}
/** Raised when Booqable returns a 423 HTTP status code. */
export declare class Locked extends ClientError {
}
/** Raised when Booqable returns a 422 HTTP status code. */
export declare class UnprocessableEntity extends ClientError {
}
/** 422 with a body matching 'is not a datetime'. */
export declare class InvalidDateTimeFormat extends UnprocessableEntity {
}
/** 422 with a body matching 'invalid date'. */
export declare class InvalidDateFormat extends UnprocessableEntity {
}
/** Raised on errors in the 500-599 range. */
export declare class ServerError extends BooqableError {
}
/** Raised when Booqable returns a 500 HTTP status code. */
export declare class InternalServerError extends ServerError {
}
/** Raised when Booqable returns a 501 HTTP status code. */
export declare class NotImplemented extends ServerError {
}
/** Raised when Booqable returns a 502 HTTP status code. */
export declare class BadGateway extends ServerError {
}
/** Raised when Booqable returns a 503 HTTP status code. */
export declare class ServiceUnavailable extends ServerError {
}
/** 503 with a body matching 'read-only'. */
export declare class ReadOnlyMode extends ServerError {
}
/** Raised when Booqable configuration is invalid. */
export declare class ConfigArgumentError extends Error {
    constructor(message: string);
}
/** Raised when a company slug is not set in Booqable configuration. */
export declare class CompanyRequired extends ConfigArgumentError {
    constructor();
}
/** Raised when single-use token auth is used without a company ID. */
export declare class SingleUseTokenCompanyIdRequired extends ConfigArgumentError {
    constructor();
}
/** Raised when single-use token auth is used without a user ID. */
export declare class SingleUseTokenUserIdRequired extends ConfigArgumentError {
    constructor();
}
/** Raised when single-use token auth is used without an algorithm. */
export declare class SingleUseTokenAlgorithmRequired extends ConfigArgumentError {
    constructor();
}
/** Raised when single-use token auth is used without a private key or secret. */
export declare class PrivateKeyOrSecretRequired extends ConfigArgumentError {
    constructor();
}
/** Raised when an unsupported API version is configured. */
export declare class UnsupportedAPIVersion extends ConfigArgumentError {
    constructor();
}
/** Raised when a required authentication parameter is missing. */
export declare class RequiredAuthParamMissing extends Error {
    constructor(message: string);
}
/**
 * Raised when reading an attribute that is absent from an API resource.
 *
 * Plain property access normally answers reads of absent attributes with
 * undefined, which turns typos and renamed API fields (e.g. `time_zone` vs
 * `default_timezone`) into silent data bugs. Resources created by this
 * library throw this error instead — see {@link strictResource}.
 *
 * Attributes that are present in the payload with a null value still return
 * null; only reads of keys that are absent from the payload throw.
 *
 * This inherits from TypeError (not BooqableError) because an absent
 * attribute is a programming error in the caller, not an API failure.
 */
export declare class MissingAttribute extends TypeError {
    readonly attributeName: string;
    constructor(attributeName: string, attrs: Record<string, unknown>);
}
export declare const RATE_LIMITED_ERRORS: (typeof TooManyRequests)[];
/**
 * Returns the appropriate BooqableError subclass for an HTTP response,
 * or null when the status does not indicate an error.
 */
export declare function errorClassFromResponse(response: ErrorResponse): typeof BooqableError | null;
/**
 * Builds and throws the appropriate error for an HTTP response.
 * Does nothing for successful responses.
 */
export declare function raiseForResponse(response: ErrorResponse): void;
