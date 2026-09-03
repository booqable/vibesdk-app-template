/**
 * All Booqable API resources, kept in sync with booqable.rb's resources.json.
 *
 * A string entry defines a resource of that name; an object entry maps a
 * resource name to an alias (e.g. app_carriers is also available as carriers).
 */
export type ResourceDefinition = string | Record<string, string>;
export declare const RESOURCES: ResourceDefinition[];
/** Resource name (and alias) pairs: [methodName, resourceName]. */
export declare function resourceMethods(): Array<[string, string]>;
