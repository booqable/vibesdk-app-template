import { raiseForResponse } from './errors.js';
/**
 * OAuth2 client for Booqable API authentication.
 *
 * Handles the authorization-code flow and refresh-token exchanges against
 * the Booqable token endpoint, mirroring Booqable::OAuthClient.
 */
export class OAuthClient {
    /** OAuth2 token endpoint path, relative to the API endpoint. */
    static TOKEN_ENDPOINT = '/oauth/token';
    options;
    constructor(options) {
        this.options = options;
    }
    /**
     * Exchanges an authorization code (from the OAuth callback) for an
     * access token hash.
     */
    async getTokenFromCode(code, { scope = 'full_access' } = {}) {
        const params = {
            grant_type: 'authorization_code',
            code,
            scope,
        };
        if (this.options.redirectUri)
            params.redirect_uri = this.options.redirectUri;
        return this.tokenRequest(params);
    }
    /** Exchanges a refresh token for a new access token hash. */
    async refreshToken(token) {
        if (!token.refresh_token) {
            throw new Error('A refresh_token is not available for this token.');
        }
        return this.tokenRequest({
            grant_type: 'refresh_token',
            refresh_token: String(token.refresh_token),
        });
    }
    /**
     * Normalizes a stored token hash: computes epoch-seconds `expires_at`
     * from `expires_in`/`created_at` when absent, and coerces Date/string
     * expiries to epoch seconds (e.g. an ORM datetime handed back by readToken).
     */
    static normalizeToken(token) {
        const normalized = { ...token };
        if (normalized.expires_at instanceof Date) {
            normalized.expires_at = Math.floor(normalized.expires_at.getTime() / 1000);
        }
        else if (typeof normalized.expires_at === 'string') {
            const numeric = Number(normalized.expires_at);
            normalized.expires_at = Number.isFinite(numeric)
                ? numeric
                : Math.floor(new Date(normalized.expires_at).getTime() / 1000);
        }
        if (normalized.expires_at == null && typeof normalized.expires_in === 'number') {
            const createdAt = typeof normalized.created_at === 'number' ? normalized.created_at : Math.floor(Date.now() / 1000);
            normalized.expires_at = createdAt + normalized.expires_in;
        }
        return normalized;
    }
    async tokenRequest(params) {
        const url = `${this.options.apiEndpoint}${OAuthClient.TOKEN_ENDPOINT}`;
        const body = new URLSearchParams({
            ...params,
            client_id: this.options.clientId,
            client_secret: this.options.clientSecret,
        }).toString();
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const text = await response.text();
        raiseForResponse({
            status: response.status,
            headers: response.headers,
            body: text,
            url,
            method: 'POST',
            requestBody: body,
        });
        const token = JSON.parse(text);
        return OAuthClient.normalizeToken(token);
    }
}
