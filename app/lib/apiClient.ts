import { getAuth } from 'firebase/auth';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      try {
        const token = await user.getIdToken();
        return {
          'Authorization': `Bearer ${token}`,
        };
      } catch (error) {
        console.error('Failed to get auth token:', error);
        throw new Error('Authentication required');
      }
    }
    
    throw new Error('User not authenticated');
  }

  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Request-ID': crypto.randomUUID(),
    };
  }

  private async buildHeaders(options: ApiRequestOptions): Promise<Record<string, string>> {
    const defaultHeaders = this.getDefaultHeaders();
    
    let headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    if (options.requireAuth) {
      const authHeaders = await this.getAuthHeaders();
      headers = {
        ...headers,
        ...authHeaders,
      };
    }

    return headers;
  }

  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      requireAuth = false,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const headers = await this.buildHeaders(options);
      
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (body) {
        if (body instanceof FormData) {
          requestOptions.body = body;
          // Remove Content-Type header for FormData to let browser set it with boundary
          delete headers['Content-Type'];
        } else {
          requestOptions.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // If not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }
    } catch (error) {
      console.error(`API request failed for ${method} ${url}:`, error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Export class for creating custom instances
export default ApiClient;