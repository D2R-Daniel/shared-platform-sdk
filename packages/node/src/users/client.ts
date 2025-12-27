import axios, { AxiosInstance } from 'axios';
import {
  User,
  UserProfile,
  UserPreferences,
  CreateUserRequest,
  UpdateUserRequest,
  InviteUserRequest,
  UserListResponse,
  UserStats,
} from './types';

export interface UserClientOptions {
  /** Base URL of the API server */
  baseUrl: string;
  /** JWT access token for authentication */
  accessToken?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  role?: string;
  teamId?: string;
  sort?: string;
}

/**
 * Client for user management operations.
 */
export class UserClient {
  private http: AxiosInstance;
  private accessToken?: string;

  constructor(options: UserClientOptions) {
    this.accessToken = options.accessToken;

    this.http = axios.create({
      baseURL: `${options.baseUrl.replace(/\/$/, '')}/api/v1`,
      timeout: options.timeout ?? 30000,
      headers: this.buildHeaders(),
    });
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async list(params: ListUsersParams = {}): Promise<UserListResponse> {
    const response = await this.http.get<UserListResponse>('/users', {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        search: params.search,
        status: params.status,
        role: params.role,
        team_id: params.teamId,
        sort: params.sort ?? '-created_at',
      },
    });
    return response.data;
  }

  async get(userId: string): Promise<User> {
    const response = await this.http.get<User>(`/users/${userId}`);
    return response.data;
  }

  async create(request: CreateUserRequest): Promise<User> {
    const response = await this.http.post<User>('/users', request);
    return response.data;
  }

  async update(userId: string, request: UpdateUserRequest): Promise<User> {
    const response = await this.http.put<User>(`/users/${userId}`, request);
    return response.data;
  }

  async delete(userId: string): Promise<void> {
    await this.http.delete(`/users/${userId}`);
  }

  async updateStatus(userId: string, status: string, reason?: string): Promise<User> {
    const response = await this.http.patch<User>(`/users/${userId}/status`, {
      status,
      reason,
    });
    return response.data;
  }

  async updateRoles(userId: string, roles: string[]): Promise<User> {
    const response = await this.http.put<User>(`/users/${userId}/roles`, { roles });
    return response.data;
  }

  async resetPassword(userId: string, sendEmail: boolean = true): Promise<{ message: string; temporaryPassword?: string }> {
    const response = await this.http.post<{ message: string; temporaryPassword?: string }>(
      `/users/${userId}/password`,
      { send_email: sendEmail }
    );
    return response.data;
  }

  async invite(request: InviteUserRequest): Promise<{ id: string; email: string; status: string }> {
    const response = await this.http.post('/users/invite', request);
    return response.data;
  }

  async getStats(): Promise<UserStats> {
    const response = await this.http.get<UserStats>('/users/stats');
    return response.data;
  }

  // Profile operations (current user)

  async getMyProfile(): Promise<UserProfile> {
    const response = await this.http.get<UserProfile>('/me');
    return response.data;
  }

  async updateMyProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.http.patch<UserProfile>('/me', data);
    return response.data;
  }

  async getMyPreferences(): Promise<UserPreferences> {
    const response = await this.http.get<UserPreferences>('/me/preferences');
    return response.data;
  }

  async updateMyPreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await this.http.patch<UserPreferences>('/me/preferences', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.http.post('/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }
}
