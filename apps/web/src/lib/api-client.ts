const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  private tenantId: string | null = null;
  private accessToken: string | null = null;

  setTenantId(id: string | null) {
    this.tenantId = id;
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem('tenant_id', id);
      else localStorage.removeItem('tenant_id');
    }
  }

  getTenantId(): string | null {
    if (!this.tenantId && typeof window !== 'undefined') {
      this.tenantId = localStorage.getItem('tenant_id');
    }
    return this.tenantId;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const tenantId = this.getTenantId();
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errorData.detail || errorData.message || 'An unexpected error occurred');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
