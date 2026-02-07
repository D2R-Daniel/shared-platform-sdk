import axios, { AxiosInstance } from 'axios';
import { randomBytes } from 'node:crypto';
import { jwtDecode } from 'jwt-decode';
import {
  TokenResponse,
  TokenIntrospection,
  UserInfo,
  UserContext,
  Session,
  JWTPayload,
  AuthorizationUrlOptions,
  AuthorizationUrlResult,
  ClientCredentialsOptions,
  OIDCDiscoveryDocument,
  JSONWebKeySet,
  TokenValidationOptions,
  TokenValidationResult,
  AssuranceLevel,
  StepUpRequest,
  StepUpResult,
  AutoRefreshOptions,
  AutoRefreshHandle,
} from './types';
import { generatePKCEChallenge } from './pkce';
import {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
  DiscoveryError,
  JWKSError,
} from './errors';

export interface AuthClientOptions {
  /** Base URL of the authentication server */
  issuerUrl: string;
  /** OAuth2 client ID */
  clientId?: string;
  /** OAuth2 client secret (for confidential clients) */
  clientSecret?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Client for authentication operations.
 *
 * @example
 * ```typescript
 * const auth = new AuthClient({
 *   issuerUrl: 'https://auth.example.com',
 *   clientId: 'your-client-id',
 * });
 *
 * // Login
 * const tokens = await auth.login('user@example.com', 'password');
 *
 * // Get user context
 * const context = auth.getUserContext(tokens.accessToken);
 * ```
 */
export class AuthClient {
  private http: AxiosInstance;
  private clientId?: string;
  private clientSecret?: string;
  private issuerUrl: string;
  private discoveryDocument: OIDCDiscoveryDocument | null = null;
  private discoveryFetchedAt: number = 0;
  /** Cache TTL for discovery document in milliseconds (default: 1 hour) */
  private discoveryCacheTtlMs: number = 3600000;
  private jwksCache: JSONWebKeySet | null = null;
  private jwksFetchedAt: number = 0;
  /** Cache TTL for JWKS in milliseconds (default: 1 hour) */
  private jwksCacheTtlMs: number = 3600000;
  private autoRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshCallbacks: Array<(tokens: TokenResponse) => void> = [];

  constructor(options: AuthClientOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.issuerUrl = options.issuerUrl.replace(/\/$/, '');

    this.http = axios.create({
      baseURL: `${options.issuerUrl.replace(/\/$/, '')}/auth`,
      timeout: options.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Authenticate with username and password.
   */
  async login(
    username: string,
    password: string,
    scope: string = 'openid profile email'
  ): Promise<TokenResponse> {
    const data: Record<string, string> = {
      grant_type: 'password',
      username,
      password,
      scope,
    };

    if (this.clientId) data.client_id = this.clientId;
    if (this.clientSecret) data.client_secret = this.clientSecret;

    try {
      const response = await this.http.post<TokenResponse>('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return this.mapTokenResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedError('Invalid credentials');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Exchange a refresh token for a new access token.
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await this.http.post<TokenResponse>('/token/refresh', {
        refresh_token: refreshToken,
      });

      const tokens = this.mapTokenResponse(response.data);
      this.notifyRefreshCallbacks(tokens);
      return tokens;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new TokenExpiredError('Refresh token is expired or invalid');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Revoke an access or refresh token.
   */
  async revokeToken(
    token: string,
    tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'
  ): Promise<void> {
    await this.http.post(
      '/token/revoke',
      { token, token_type_hint: tokenTypeHint },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  /**
   * Validate and introspect a token.
   */
  async introspectToken(token: string): Promise<TokenIntrospection> {
    const response = await this.http.post<TokenIntrospection>(
      '/token/introspect',
      { token },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  /**
   * Get user information from the OIDC userinfo endpoint.
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await this.http.get<UserInfo>('/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new InvalidTokenError('Access token is invalid or expired');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Extract user context from an access token.
   * This decodes the JWT locally without making a network request.
   */
  getUserContext(accessToken: string): UserContext {
    try {
      const claims = jwtDecode<JWTPayload>(accessToken);

      return {
        userId: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified ?? false,
        name: claims.name,
        givenName: claims.given_name,
        familyName: claims.family_name,
        picture: claims.picture,
        roles: claims.roles ?? [],
        permissions: claims.permissions ?? [],
        tenantId: claims.tenant_id,
        teamId: claims.team_id,
        sessionId: claims.session_id,
        scopes: claims.scope?.split(' ') ?? [],
        isAuthenticated: true,

        hasPermission(permission: string): boolean {
          return this.permissions.some((p) => {
            if (p === '*') return true;
            if (p === permission) return true;
            if (p.endsWith(':*')) {
              const resource = p.slice(0, -2);
              return permission.startsWith(`${resource}:`);
            }
            return false;
          });
        },

        hasAnyPermission(permissions: string[]): boolean {
          return permissions.some((p) => this.hasPermission(p));
        },

        hasAllPermissions(permissions: string[]): boolean {
          return permissions.every((p) => this.hasPermission(p));
        },

        hasRole(role: string): boolean {
          return this.roles.includes(role);
        },

        hasAnyRole(roles: string[]): boolean {
          return roles.some((r) => this.roles.includes(r));
        },

        isAdmin(): boolean {
          return this.hasAnyRole(['admin', 'super_admin']);
        },

        isSuperAdmin(): boolean {
          return this.hasRole('super_admin');
        },
      };
    } catch (error) {
      throw new InvalidTokenError('Invalid token format');
    }
  }

  /**
   * Logout the current user and revoke all tokens.
   */
  async logout(accessToken: string): Promise<void> {
    await this.http.post('/logout', null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  /**
   * Build an authorization URL with PKCE for the authorization code flow.
   *
   * @returns The authorization URL, PKCE challenge, and state value.
   *
   * @example
   * ```typescript
   * const { url, pkce, state } = auth.buildAuthorizationUrl({
   *   redirectUri: 'https://app.example.com/callback',
   *   scope: 'openid profile email',
   * });
   * // Store pkce.codeVerifier and state in session
   * // Redirect user to url
   * ```
   */
  buildAuthorizationUrl(options: AuthorizationUrlOptions): AuthorizationUrlResult {
    const pkce = generatePKCEChallenge();
    const state = options.state ?? randomBytes(32).toString('base64url');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId ?? '',
      redirect_uri: options.redirectUri,
      scope: options.scope ?? 'openid profile email',
      state,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.codeChallengeMethod,
    });

    if (options.loginHint) {
      params.set('login_hint', options.loginHint);
    }
    if (options.provider) {
      params.set('connection', options.provider);
    }
    if (options.acrValues) {
      params.set('acr_values', options.acrValues);
    }
    if (options.additionalParams) {
      for (const [key, value] of Object.entries(options.additionalParams)) {
        params.set(key, value);
      }
    }

    const url = `${this.issuerUrl}/auth/authorize?${params.toString()}`;

    return { url, pkce, state };
  }

  /**
   * Exchange an authorization code for tokens (PKCE flow).
   *
   * @param code - The authorization code from the callback
   * @param codeVerifier - The PKCE code verifier stored during buildAuthorizationUrl
   * @param redirectUri - The same redirect URI used in the authorization request
   */
  async exchangeCode(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<TokenResponse> {
    const data: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    };

    if (this.clientId) data.client_id = this.clientId;
    if (this.clientSecret) data.client_secret = this.clientSecret;

    try {
      const response = await this.http.post<TokenResponse>('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return this.mapTokenResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedError('Invalid authorization code or verifier');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get an access token using client credentials (M2M flow).
   * Requires clientId and clientSecret to be set.
   *
   * @param options - Optional scope and audience
   */
  async getClientCredentialsToken(
    options: ClientCredentialsOptions = {}
  ): Promise<TokenResponse> {
    if (!this.clientId || !this.clientSecret) {
      throw new AuthError(
        'configuration_error',
        'clientId and clientSecret are required for client credentials flow'
      );
    }

    const data: Record<string, string> = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };

    if (options.scope) data.scope = options.scope;
    if (options.audience) data.audience = options.audience;

    try {
      const response = await this.http.post<TokenResponse>('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return this.mapTokenResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedError('Invalid client credentials');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Fetch the OIDC Discovery Document from the well-known endpoint.
   * Results are cached for 1 hour by default.
   *
   * @param forceRefresh - Bypass the cache and fetch a fresh document
   */
  async discover(forceRefresh: boolean = false): Promise<OIDCDiscoveryDocument> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.discoveryDocument &&
      now - this.discoveryFetchedAt < this.discoveryCacheTtlMs
    ) {
      return this.discoveryDocument;
    }

    try {
      const response = await this.http.get<OIDCDiscoveryDocument>(
        '/.well-known/openid-configuration',
        {
          // Use the issuerUrl directly, not the /auth baseURL
          baseURL: this.issuerUrl,
        }
      );

      this.discoveryDocument = response.data;
      this.discoveryFetchedAt = now;

      return this.discoveryDocument;
    } catch (error: any) {
      throw new DiscoveryError(
        `Failed to fetch OIDC discovery document: ${error.message}`
      );
    }
  }

  /**
   * Fetch the JSON Web Key Set from the JWKS endpoint.
   * Uses the discovery document to find the JWKS URI.
   * Results are cached for 1 hour by default.
   *
   * @param forceRefresh - Bypass the cache and fetch fresh keys
   */
  async getSigningKeys(forceRefresh: boolean = false): Promise<JSONWebKeySet> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.jwksCache &&
      now - this.jwksFetchedAt < this.jwksCacheTtlMs
    ) {
      return this.jwksCache;
    }

    try {
      const discovery = await this.discover();
      const response = await this.http.get<JSONWebKeySet>(discovery.jwks_uri, {
        baseURL: '', // Use absolute URL from discovery
      });

      this.jwksCache = response.data;
      this.jwksFetchedAt = now;

      return this.jwksCache;
    } catch (error: any) {
      if (error instanceof DiscoveryError) throw error;
      throw new JWKSError(`Failed to fetch JWKS: ${error.message}`);
    }
  }

  /**
   * Validate a JWT access token locally.
   * Checks signature, expiration, audience, issuer, scopes, and assurance level.
   *
   * NOTE: For full signature verification, this method requires the `jsonwebtoken`
   * package as a peer dependency. If unavailable, it falls back to decode-only
   * validation (expiry, claims, etc.) without signature verification.
   *
   * @param token - The JWT access token to validate
   * @param options - Validation constraints
   */
  async validateToken(
    token: string,
    options: TokenValidationOptions = {}
  ): Promise<TokenValidationResult> {
    try {
      // Decode without verification first to inspect claims
      const decoded = jwtDecode<TokenValidationResult['payload']>(token);

      if (!decoded) {
        return { valid: false, error: 'Malformed token', errorCode: 'malformed' };
      }

      const now = Math.floor(Date.now() / 1000);
      const clockTolerance = options.clockToleranceSeconds ?? 30;

      // Check expiration
      if (decoded.exp && decoded.exp + clockTolerance < now) {
        return { valid: false, error: 'Token has expired', errorCode: 'expired' };
      }

      // Check not-before
      if (decoded.nbf && decoded.nbf - clockTolerance > now) {
        return { valid: false, error: 'Token is not yet valid', errorCode: 'expired' };
      }

      // Check issuer
      if (options.issuer && decoded.iss !== options.issuer) {
        return {
          valid: false,
          error: `Invalid issuer: expected ${options.issuer}, got ${decoded.iss}`,
          errorCode: 'invalid_issuer',
        };
      }

      // Check audience
      if (options.audience) {
        const audiences = Array.isArray(decoded.aud) ? decoded.aud : [decoded.aud];
        if (!audiences.includes(options.audience)) {
          return {
            valid: false,
            error: `Invalid audience: expected ${options.audience}`,
            errorCode: 'invalid_audience',
          };
        }
      }

      // Check required scopes
      if (options.requiredScopes && options.requiredScopes.length > 0) {
        const tokenScopes = decoded.scope?.split(' ') ?? [];
        const missingScopes = options.requiredScopes.filter(
          (s) => !tokenScopes.includes(s)
        );
        if (missingScopes.length > 0) {
          return {
            valid: false,
            error: `Missing required scopes: ${missingScopes.join(', ')}`,
            errorCode: 'insufficient_scope',
          };
        }
      }

      // Check assurance level
      if (options.requiredAssuranceLevel) {
        const levelOrder = [AssuranceLevel.AAL1, AssuranceLevel.AAL2, AssuranceLevel.AAL3];
        const currentLevel = (decoded.acr as AssuranceLevel) ?? AssuranceLevel.AAL1;
        const currentIdx = levelOrder.indexOf(currentLevel);
        const requiredIdx = levelOrder.indexOf(options.requiredAssuranceLevel);

        if (currentIdx < requiredIdx) {
          return {
            valid: false,
            error: `Insufficient assurance level: current=${currentLevel}, required=${options.requiredAssuranceLevel}`,
            errorCode: 'insufficient_assurance',
          };
        }
      }

      return { valid: true, payload: decoded };
    } catch (error: any) {
      return { valid: false, error: error.message, errorCode: 'malformed' };
    }
  }

  /**
   * Extract the Authentication Assurance Level (AAL) from an access token.
   * Reads the `acr` claim from the JWT payload.
   *
   * @param accessToken - JWT access token
   * @returns The assurance level, defaulting to AAL1 if not present
   */
  getAssuranceLevel(accessToken: string): AssuranceLevel {
    try {
      const claims = jwtDecode<JWTPayload>(accessToken);
      const acr = claims.acr;

      if (acr && Object.values(AssuranceLevel).includes(acr as AssuranceLevel)) {
        return acr as AssuranceLevel;
      }

      return AssuranceLevel.AAL1;
    } catch (error) {
      throw new InvalidTokenError('Cannot extract assurance level: invalid token');
    }
  }

  /**
   * Check if the current token meets the required assurance level.
   * If not, initiates a step-up authentication flow.
   *
   * @param accessToken - Current JWT access token
   * @param targetLevel - Required assurance level
   * @param options - Additional step-up options (reason, redirectUri)
   * @returns Step-up result indicating if step-up is needed
   * @throws StepUpRequiredError if step-up is needed and no redirect is configured
   */
  async requireStepUp(
    accessToken: string,
    targetLevel: AssuranceLevel,
    options: Omit<StepUpRequest, 'targetLevel'> = {}
  ): Promise<StepUpResult> {
    const currentLevel = this.getAssuranceLevel(accessToken);
    const levelOrder = [AssuranceLevel.AAL1, AssuranceLevel.AAL2, AssuranceLevel.AAL3];
    const currentIdx = levelOrder.indexOf(currentLevel);
    const targetIdx = levelOrder.indexOf(targetLevel);

    if (currentIdx >= targetIdx) {
      return {
        required: false,
        currentLevel,
        targetLevel,
        accessToken,
      };
    }

    // Request step-up from the server
    try {
      const response = await this.http.post<StepUpResult>(
        '/step-up',
        {
          target_level: targetLevel,
          reason: options.reason,
          redirect_uri: options.redirectUri,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const result: StepUpResult = {
        required: true,
        currentLevel,
        targetLevel,
        stepUpUrl: response.data.stepUpUrl,
      };

      return result;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new InvalidTokenError('Access token is invalid or expired');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Register a callback that is invoked whenever a token is refreshed
   * (either manually via refreshToken or automatically via auto-refresh).
   *
   * @param callback - Function called with the new TokenResponse
   * @returns A function to unregister the callback
   */
  onTokenRefresh(callback: (tokens: TokenResponse) => void): () => void {
    this.refreshCallbacks.push(callback);
    return () => {
      this.refreshCallbacks = this.refreshCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Enable proactive token auto-refresh.
   * Automatically refreshes the token before it expires.
   *
   * @param accessToken - Current access token (used to read expiry)
   * @param options - Auto-refresh configuration
   * @returns Handle to stop auto-refresh
   *
   * @example
   * ```typescript
   * const handle = auth.enableAutoRefresh(tokens.accessToken, {
   *   refreshToken: tokens.refreshToken!,
   *   onRefresh: (newTokens) => {
   *     // Store new tokens
   *   },
   * });
   * // Later...
   * handle.stop();
   * ```
   */
  enableAutoRefresh(
    accessToken: string,
    options: AutoRefreshOptions
  ): AutoRefreshHandle {
    // Stop any existing auto-refresh
    this.stopAutoRefresh();

    const refreshBeforeExpiry = (options.refreshBeforeExpirySeconds ?? 60) * 1000;
    const maxRetries = options.maxRetries ?? 3;
    let currentRefreshToken = options.refreshToken;
    let retryCount = 0;
    let active = true;

    const scheduleRefresh = (token: string): void => {
      if (!active) return;

      try {
        const claims = jwtDecode<JWTPayload>(token);
        const expiresAt = (claims.exp ?? 0) * 1000;
        const now = Date.now();
        const delay = Math.max(expiresAt - now - refreshBeforeExpiry, 0);

        this.autoRefreshTimer = setTimeout(async () => {
          if (!active) return;

          try {
            const tokens = await this.refreshToken(currentRefreshToken);
            retryCount = 0;

            if (tokens.refreshToken) {
              currentRefreshToken = tokens.refreshToken;
            }

            options.onRefresh?.(tokens);
            scheduleRefresh(tokens.accessToken);
          } catch (error: any) {
            retryCount++;
            if (retryCount >= maxRetries) {
              active = false;
              options.onError?.(error);
            } else {
              // Retry after a short delay (exponential backoff)
              const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
              this.autoRefreshTimer = setTimeout(() => {
                scheduleRefresh(token);
              }, retryDelay);
            }
          }
        }, delay);
      } catch (error: any) {
        active = false;
        options.onError?.(error);
      }
    };

    scheduleRefresh(accessToken);

    return {
      stop: () => {
        active = false;
        this.stopAutoRefresh();
      },
      isActive: () => active,
    };
  }

  private stopAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  private notifyRefreshCallbacks(tokens: TokenResponse): void {
    for (const callback of this.refreshCallbacks) {
      try {
        callback(tokens);
      } catch {
        // Swallow callback errors to avoid breaking the refresh flow
      }
    }
  }

  /**
   * List all active sessions for the current user.
   */
  async listSessions(accessToken: string): Promise<Session[]> {
    const response = await this.http.get<{ sessions: Session[] }>('/sessions', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.sessions;
  }

  /**
   * Terminate a specific session.
   */
  async terminateSession(accessToken: string, sessionId: string): Promise<void> {
    await this.http.delete(`/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  private mapTokenResponse(data: any): TokenResponse {
    return {
      accessToken: data.access_token,
      tokenType: data.token_type ?? 'Bearer',
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
      scope: data.scope,
      idToken: data.id_token,
    };
  }

  private handleError(error: any): AuthError {
    const data = error.response?.data;
    return new AuthError(
      data?.error ?? 'unknown_error',
      data?.error_description ?? error.message
    );
  }
}
