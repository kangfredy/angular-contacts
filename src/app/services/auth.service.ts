import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { User, AuthResponse, AuthState } from '../models/auth.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: this.hasToken(),
    token: this.getToken(),
  });

  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check token validation on service initialization
    this.validateTokenOnInit();
  }

  private validateTokenOnInit(): void {
    if (this.hasToken()) {
      // You could add a request to validate the token with the backend here
      // For now, we'll just log that we found a token
      console.log('Token found in localStorage, user is authenticated');
    }
  }

  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      map((response) => {
        // Mengambil token dari struktur response yang benar
        if (response && response.data && response.data.access_token) {
          return { token: response.data.access_token };
        }
        return { token: null };
      }),
      tap((tokenObj) => {
        if (tokenObj.token) {
          this.setToken(tokenObj.token);
        } else {
          console.error('No token received from register API');
        }
      })
    );
  }

  login(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      map((response) => {
        // Mengambil token dari struktur response yang benar
        if (response && response.data && response.data.access_token) {
          return { token: response.data.access_token };
        }
        return { token: null };
      }),
      tap((tokenObj) => {
        if (tokenObj.token) {
          this.setToken(tokenObj.token);
        } else {
          console.error('No token received from login API');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authStateSubject.next({
      isAuthenticated: false,
      token: null,
    });
    this.router.navigate(['/login']);
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      console.log('Token successfully saved to localStorage');
      this.authStateSubject.next({
        isAuthenticated: true,
        token,
      });
    } catch (e) {
      console.error('Error storing token in localStorage:', e);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): boolean {
    const isAuth = this.hasToken();
    console.log('Authentication status:', isAuth);
    return isAuth;
  }

  // Method to check if token exists and redirect to contacts
  checkAuthAndRedirect(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/contacts']);
    }
  }
}
