import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@/environments/environment';
import { 
  User, 
  AuthResponse, 
  PasswordResetRequest, 
  PasswordResetResponse,
  TokenValidationResponse,
  ResetPasswordData
} from '@/app/models/UserModel';
import { catchError, tap, throwError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();
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

  register(userData: { 
    first_name: string; 
    last_name: string; 
    username: string;
    email: string; 
    password: string 
  }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => this.handleAuthentication(response)),
      catchError(this.handleError)
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuthentication(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    this._currentUser.set(response.user);
  }

  requestPasswordReset(email: string) {
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/forgot-password`, 
      { email }
    ).pipe(
      catchError(() => of({ 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para resetear tu contraseña',
        success: true // Mostrar mismo mensaje aunque falle (por seguridad)
      }))
    );
  }

  verifyResetToken(token: string) {
    return this.http.get<TokenValidationResponse>(
      `${this.apiUrl}/verify-reset-token?token=${token}`
    ).pipe(
      catchError(() => of({ valid: false }))
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<PasswordResetResponse>(
      `${this.apiUrl}/reset-password`, 
      { token, newPassword }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth error:', error);
    let errorMessage = 'Ocurrió un error';
    
    if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status >= 500) {
      errorMessage = 'Error en el servidor. Por favor intente más tarde.';
    }
    
    return throwError(() => ({ 
      message: errorMessage,
      status: error.status 
    }));
  }
}
