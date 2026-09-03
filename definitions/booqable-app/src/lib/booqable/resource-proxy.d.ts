import { HttpClient } from './http.js';
/**
 * Generic resource proxy for API collections.
 *
 * Provides a uniform interface for interacting with API resources using
 * standard CRUD operations. Each resource proxy handles the JSON:API
 * formatting and delegates HTTP requests to the underlying client.
 *
 * @example Working with orders
 *   const orders = client.orders
 *
 *   await orders.list({ include: 'customer', filter: { status: 'reserved' } })
 *   await orders.find('123', { include: 'customer' })
 *   await orders.create({ starts_at: '2024-01-01T00:00:00Z', status: 'draft' })
 *   await orders.update('123', { status: 'reserved' })
 *   await orders.delete('123')
 */
export declare class ResourceProxy {
    private http;
    private resource;
    constructor(http: HttpClient, resourceName: string);
    /**
     * List resources, with optional filtering, sorting, and pagination
     * (JSON:API query parameters: `include`, `filter`, `sort`, `page`, …).
     * Fetches all pages when `autoPaginate` is enabled.
     */
    list(params?: Record<string, any>): Promise<any[]>;
    /** Alias for {@link list}. */
    all(params?: Record<string, any>): Promise<any[]>;
    /** Find a specific resource by ID. */
    find(id: string, params?: Record<string, any>): Promise<any>;
    /** Create a new resource with the given attributes. */
    create(attributes?: Record<string, any>): Promise<any>;
    /** Update an existing resource with the given attributes. */
    update(id: string, attributes?: Record<string, any>): Promise<any>;
    /** Delete an existing resource by ID. Returns the deleted resource. */
    delete(id: string): Promise<any>;
    private wrap;
}
