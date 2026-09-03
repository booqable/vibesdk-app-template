/**
 * JSON:API serializer.
 *
 * Handles encoding and decoding of JSON:API documents with automatic
 * relationship population and attribute flattening, mirroring
 * Booqable::JsonApiSerializer from booqable.rb:
 *
 * - `attributes` are merged into the resource object itself
 * - relationships with a `data` member are lifted to direct keys, pointing
 *   at the matching `included` resource when present (recursively), or at
 *   the bare `{ id, type }` reference otherwise
 * - an explicitly null to-one relationship (`"data": null`) keeps its key
 *   with a null value, so strict reads answer null instead of throwing
 * - the top-level `included` array is renamed to `_includes`
 * - values of keys ending in `_at`/`_on`/`date` are parsed into Date objects
 */
export declare class JsonApiSerializer {
    /**
     * Encodes an object (usually a request body) to a JSON string,
     * converting Date instances to ISO 8601 strings.
     */
    static encode(data: any): string;
    /**
     * Decodes a JSON:API string into plain objects with populated
     * relationships, flattened attributes, and parsed dates.
     * Returns null for nil or empty input.
     */
    static decode(data: string | null | undefined): any;
}
