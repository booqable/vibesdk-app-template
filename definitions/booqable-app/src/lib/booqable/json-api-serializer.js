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
const TIME_KEY_PATTERN = /(_(at|on)$)|((^|_)date$)/;
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}
function isTimeField(key, value) {
    return value != null && TIME_KEY_PATTERN.test(key);
}
function encodeValue(value) {
    if (value instanceof Date)
        return value.toISOString();
    if (Array.isArray(value))
        return value.map(encodeValue);
    if (isPlainObject(value)) {
        const result = {};
        for (const [key, entry] of Object.entries(value)) {
            result[key] = encodeValue(entry);
        }
        return result;
    }
    return value;
}
/**
 * Replaces `{ id, type }` relationship references with the matching resource
 * from the `included` array, recursively populating nested relationships.
 * A seen-set guards against reference cycles between included resources.
 */
function populateRelationships(obj, includes, seen) {
    if (Array.isArray(obj)) {
        for (const item of obj)
            populateRelationships(item, includes, seen);
        return;
    }
    if (!isPlainObject(obj) || seen.has(obj))
        return;
    seen.add(obj);
    const relationships = obj.relationships;
    if (!isPlainObject(relationships))
        return;
    const findInclude = (ref) => includes.find((inc) => inc && inc.id === ref.id && inc.type === ref.type);
    for (const value of Object.values(relationships)) {
        if (!isPlainObject(value) || !('data' in value))
            continue;
        const data = value.data;
        if (isPlainObject(data) && 'id' in data && 'type' in data) {
            const found = findInclude(data);
            if (found) {
                ;
                value.data = found;
                populateRelationships(found, includes, seen);
            }
        }
        else if (Array.isArray(data)) {
            ;
            value.data = data.map((ref) => {
                if (isPlainObject(ref) && 'id' in ref && 'type' in ref) {
                    const found = findInclude(ref);
                    if (found) {
                        populateRelationships(found, includes, seen);
                        return found;
                    }
                }
                return ref;
            });
        }
    }
}
function decodeHash(hash, cache) {
    const cached = cache.get(hash);
    if (cached)
        return cached;
    const result = {};
    cache.set(hash, result);
    const working = { ...hash };
    // A document may carry its own `included` array (top-level or nested).
    if ('included' in working) {
        populateRelationships(working.data, working.included || [], new Set());
        working._includes = working.included;
        delete working.included;
    }
    // Flatten JSON:API `attributes` into the resource itself.
    if (isPlainObject(working.attributes)) {
        const attributes = working.attributes;
        delete working.attributes;
        Object.assign(working, attributes);
    }
    // Lift relationships with a `data` member to direct keys.
    if (isPlainObject(working.relationships)) {
        const relationships = working.relationships;
        delete working.relationships;
        for (const [key, value] of Object.entries(relationships)) {
            if (!isPlainObject(value) || !('data' in value))
                continue;
            const data = value.data;
            if (isPlainObject(data) || Array.isArray(data) || data === null) {
                // An explicitly null to-one relationship is present-with-null, not
                // absent: keep the key so strict reads answer null instead of
                // throwing MissingAttribute.
                working[key] = data;
            }
        }
    }
    for (const [key, value] of Object.entries(working)) {
        result[key] = decodeValue(key, value, cache);
    }
    return result;
}
function decodeValue(key, value, cache) {
    if (isTimeField(key, value)) {
        if (typeof value === 'string') {
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? value : parsed;
        }
        if (typeof value === 'number') {
            return new Date(value * 1000);
        }
    }
    if (Array.isArray(value))
        return value.map((item) => decodeValue(key, item, cache));
    if (isPlainObject(value))
        return decodeHash(value, cache);
    return value;
}
export class JsonApiSerializer {
    /**
     * Encodes an object (usually a request body) to a JSON string,
     * converting Date instances to ISO 8601 strings.
     */
    static encode(data) {
        return JSON.stringify(encodeValue(data));
    }
    /**
     * Decodes a JSON:API string into plain objects with populated
     * relationships, flattened attributes, and parsed dates.
     * Returns null for nil or empty input.
     */
    static decode(data) {
        if (data == null || data.trim() === '')
            return null;
        const parsed = JSON.parse(data);
        const cache = new WeakMap();
        if (Array.isArray(parsed))
            return parsed.map((item) => (isPlainObject(item) ? decodeHash(item, cache) : item));
        if (isPlainObject(parsed))
            return decodeHash(parsed, cache);
        return parsed;
    }
}
