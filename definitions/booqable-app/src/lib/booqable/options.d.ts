import { ClientOptions } from './types.js';
/** All valid (camelCase) configuration keys. */
export declare const OPTION_KEYS: (keyof ClientOptions)[];
/**
 * Accepted aliases for configuration options, mapping the alias to its
 * canonical key. Snake_case spellings of every option are also accepted
 * and camelized automatically.
 */
export declare const OPTION_ALIASES: Record<string, keyof ClientOptions>;
/** Default media type (JSON:API) for requests. */
export declare const MEDIA_TYPE = "application/vnd.api+json";
/** Default User-Agent header string. */
export declare const USER_AGENT = "Booqable JavaScript Client 2.1.0";
/** Default configuration, with environment variable overrides (Node.js). */
export declare function defaultOptions(): ClientOptions;
/**
 * Normalizes user-supplied options: camelizes snake_case keys, resolves
 * aliases, and validates that every key is a known configuration option
 * (suggesting similarly-named valid options when one is close enough).
 */
export declare function normalizeOptions(options: Record<string, any>): ClientOptions;
/**
 * Constructs the complete API endpoint URL from the configured company,
 * domain, protocol, and API version.
 *
 * @throws {UnsupportedAPIVersion} when the API version is not supported
 * @throws {CompanyRequired} when no company is configured
 */
export declare function apiEndpointFor(options: ClientOptions): string;
