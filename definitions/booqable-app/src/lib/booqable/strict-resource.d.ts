/**
 * Wraps a decoded resource object in a Proxy that throws
 * {@link MissingAttribute} when an absent attribute is read.
 * Nested objects and array elements are wrapped lazily on access.
 */
export declare function strictResource<T extends object>(target: T): T;
/** Wraps each element of a decoded collection in a strict resource proxy. */
export declare function strictCollection(records: any): any;
