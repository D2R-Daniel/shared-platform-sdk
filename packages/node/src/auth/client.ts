import axios, { AxiosInstance } from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  TokenResponse,
  TokenIntrospection,
  UserInfo,
  UserContext,
  Session,
  JWTPayload,
} from './types';
import {
  AuthError,
  TokenExpiredError,
  InvalidTokenError,
  UnauthorizedError,
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

  constructor(options: AuthClientOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;

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

      return this.mapTokenResponse(response.data);
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
