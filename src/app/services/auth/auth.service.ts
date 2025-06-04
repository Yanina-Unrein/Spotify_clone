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
import { catchError, tap, throwError, of, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ApiError, FieldError, RegisterData, RegisterResponse } from '@/app/models/Register';

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

  register(userData: RegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/registrarse`, userData).pipe(
      tap((response: RegisterResponse) => this.handleAuthentication(response)),
      catchError((error: HttpErrorResponse) => this.handleRegisterError(error)) 
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

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    console.log('🔍 Verificando email:', email); // Log para debug
    return this.http.post<{ exists: boolean }>(`${this.apiUrl}/check-email`, { email }).pipe(
      tap(response => console.log('📊 Respuesta del servidor:', response)), // Log para debug
      catchError((error) => {
        console.error('❌ Error checking email:', error);
        return of({ exists: false }); // Si hay error, asumimos que no existe
      })
    );
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

  private handleRegisterError(error: HttpErrorResponse): Observable<never> {
   console.error('Error del servidor:', error);
  
    let errorMessage = 'Ocurrió un error en el registro';
    const fieldErrors: FieldError[] = [];

    // Manejo especial para error de email existente
    if (error.status === 400 || error.status === 409) {
      if (error.error?.error?.includes('ya está en uso')) {
        return throwError(() => ({
          message: 'El email ya está registrado',
          status: error.status,
          fieldErrors: [{ field: 'email', message: 'Esta dirección ya está vinculada a una cuenta' }],
          rawError: error,
          isEmailExists: true // Nueva propiedad para identificar este error específico
        }));
      }
    }

    // Manejo genérico de otros errores
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      }

      // Procesar errores de validación
      if (error.error.errors) {
        Object.entries(error.error.errors).forEach(([field, messages]) => {
          fieldErrors.push({
            field,
            message: Array.isArray(messages) ? messages.join(' ') : String(messages)
          });
        });
      }
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      fieldErrors,
      rawError: error
    }));
  }
}
