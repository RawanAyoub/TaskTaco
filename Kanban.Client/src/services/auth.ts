/// Authentication service for managing user authentication and JWT tokens

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_BASE_URL = 'http://localhost:5090/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token and user from localStorage on initialization
    this.token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    this.user = userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const authResponse: AuthResponse = await response.json();
    this.setAuth(authResponse.token, authResponse.user);
    return authResponse;
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const authResponse: AuthResponse = await response.json();
    this.setAuth(authResponse.token, authResponse.user);
    return authResponse;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired');
      }
      throw new Error('Failed to get user info');
    }

    const user: User = await response.json();
    console.log('AuthService - getCurrentUser received:', user);
    this.user = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  /**
   * Logout and clear authentication data
   */
  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Set authentication token and user data
   */
  private setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get the current JWT token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get the current user
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      return {};
    }
    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }
}

export const authService = new AuthService();
