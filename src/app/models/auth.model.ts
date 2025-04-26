export interface User {
  username: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}
