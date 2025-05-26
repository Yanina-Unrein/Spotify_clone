import { AuthResponse, User } from '@/app/models/UserModel';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Signal privada para el estado del usuario
  private _currentUser = signal<User | null>(null);

  // Exponemos la Signal como readonly
  currentUser = this._currentUser.asReadonly();

  // Computed property para saber si está autenticado
  isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    this.initializeUser();
  }
  private initializeUser() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this._currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  register(userData: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => this.handleAuthentication(response))
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this._currentUser.set(null);
  }

  private handleAuthentication(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    this._currentUser.set(response.user);
  }

  verifyAndLoadUser() {
  return this.http.get<{user: User, token: string}>(`${this.apiUrl}/verify`).pipe(
    tap(response => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      this._currentUser.set(response.user);
    }),
    catchError(error => {
      this.logout();
      return throwError(() => error);
    })
  );
}
}
