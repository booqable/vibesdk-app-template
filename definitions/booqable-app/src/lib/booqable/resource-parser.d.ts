/**
 * Parses JSON:API payloads (webhook payloads or raw API responses) into
 * plain objects with flattened attributes and populated relationships.
 *
 * @example
 *   const customer = parseResource('{"data":{"id":"123","type":"customers","attributes":{"name":"John"}}}')
 *   customer.id   // => "123"
 *   customer.name // => "John"
 *
 * @param payload - JSON:API payload (JSON string or already-parsed object)
 * @param strict - throw {@link MissingAttribute} on absent attribute reads (default: true)
 * @returns the parsed resource, or null for empty input
 */
export declare function parseResource(payload: string | Record<string, any> | null | undefined, { strict }?: {
    strict?: boolean | undefined;
}): any;
