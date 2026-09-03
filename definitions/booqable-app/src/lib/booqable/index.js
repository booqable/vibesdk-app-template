import { BooqableClient } from './client.js';
import { resourceMethods } from './resources.js';
/**
 * Module-level Booqable API entry point.
 *
 * Mirrors the `Booqable` module from booqable.rb: configure once, then call
 * resource methods directly. A default client is (re)created from the
 * module-level configuration.
 *
 * @example
 *   import Booqable from '@booqable/client'
 *
 *   Booqable.configure({ apiKey: 'your_api_key', companyId: 'your_company' })
 *
 *   const orders = await Booqable.orders.list({ include: 'customer' })
 */
class BooqableModule {
    moduleOptions = {};
    defaultClient = null;
    constructor() {
        for (const [methodName] of resourceMethods()) {
            Object.defineProperty(this, methodName, {
                get: () => this.client()[methodName],
                enumerable: false,
                configurable: true,
            });
        }
    }
    /**
     * Set module-level configuration options, merged into any previous ones.
     * Accepts an options object or a callback that mutates a draft object.
     */
    configure(options) {
        if (typeof options === 'function') {
            const draft = { ...this.moduleOptions };
            options(draft);
            this.moduleOptions = draft;
        }
        else {
            this.moduleOptions = { ...this.moduleOptions, ...options };
        }
        this.defaultClient = null;
        return this;
    }
    /** Reset module-level configuration to defaults. */
    reset() {
        this.moduleOptions = {};
        this.defaultClient = null;
        return this;
    }
    /** The API client built from the module-level configuration. */
    client() {
        this.defaultClient ??= new BooqableClient(this.moduleOptions);
        return this.defaultClient;
    }
    /** Access a resource proxy by name. */
    resource(name) {
        return this.client().resource(name);
    }
    async get(path, data = {}) {
        return this.client().get(path, data);
    }
    async head(path, data = {}) {
        return this.client().head(path, data);
    }
    async post(path, data = {}) {
        return this.client().post(path, data);
    }
    async put(path, data = {}) {
        return this.client().put(path, data);
    }
    async patch(path, data = {}) {
        return this.client().patch(path, data);
    }
    async delete(path, data = {}) {
        return this.client().delete(path, data);
    }
    async request(method, path, data = {}) {
        return this.client().request(method, path, data);
    }
    async paginate(path, params = {}) {
        return this.client().paginate(path, params);
    }
    rateLimit() {
        return this.client().rateLimit();
    }
    get lastResponse() {
        return this.client().lastResponse;
    }
    async authenticateWithCode(code) {
        return this.client().authenticateWithCode(code);
    }
    parseResource(payload) {
        return this.client().parseResource(payload);
    }
    deserializeResource(payload) {
        return this.client().parseResource(payload);
    }
}
/** The module-level Booqable API entry point. */
const Booqable = new BooqableModule();
export default Booqable;
export { Booqable };
export { BooqableClient } from './client.js';
export { ResourceProxy } from './resource-proxy.js';
export { RateLimit } from './rate-limit.js';
export { JsonApiSerializer } from './json-api-serializer.js';
export { parseResource } from './resource-parser.js';
export { strictResource, strictCollection } from './strict-resource.js';
export { OAuthClient } from './oauth-client.js';
export { HttpClient } from './http.js';
export { ApiKeyAuth } from './auth/api-key.js';
export { OAuthAuth } from './auth/oauth.js';
export { SingleUseAuth } from './auth/single-use.js';
export { signJwt } from './jwt.js';
export { RESOURCES, resourceMethods } from './resources.js';
export { VERSION } from './version.js';
export * from './errors.js';
