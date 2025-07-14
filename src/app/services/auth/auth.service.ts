import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@/environments/environment';
import { 
  User, 
  AuthResponse, 
  PasswordResetResponse,
  TokenValidationResponse
} from '@/app/models/UserModel';
import { catchError, tap, throwError, of, Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FieldError, RegisterData } from '@/app/models/Register';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private refreshTokenInProgress = false;
  private tokenRefreshSubject: BehaviorSubject<any> | null = null;

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

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registrarse`, userData).pipe(
      tap((response: AuthResponse) => this.handleAuthentication(response)),
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
      localStorage.clear();
      sessionStorage.clear();
    }
    
    this._currentUser.set(null);

    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.post<{ exists: boolean }>(`${this.apiUrl}/check-email`, { email }).pipe(
      tap(response => console.log('Respuesta del servidor:', response)), // Log para debug
      catchError((error) => {
        console.error('Error checking email:', error);
        return of({ exists: false }); // Si hay error, asumimos que no existe
      })
    );
  }

  private handleAuthentication(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      // Usar el método público para establecer tokens
      this.setTokens(response.token, response.refreshToken);
      
      // Actualizar el usuario
      this._currentUser.set(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
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
          isEmailExists: true 
        }));
      }
    }

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      }

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

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  }

  isRefreshingToken(): boolean {
    return this.refreshTokenInProgress && this.tokenRefreshSubject !== null;
  }

  refreshToken(): Observable<{ token: string, refreshToken: string }> {
    if (this.tokenRefreshSubject) {
      return this.tokenRefreshSubject.asObservable();
    }
    
    this.refreshTokenInProgress = true;
    this.tokenRefreshSubject = new BehaviorSubject<any>(null);
    
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No hay token de refresco disponible'));
    }
    
    return this.http.post<{ token: string, refreshToken: string }>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(tokens => {
        // Método público para establecer tokens
        this.setTokens(tokens.token, tokens.refreshToken);
        this.refreshTokenInProgress = false;
        this.tokenRefreshSubject?.next(tokens);
        this.tokenRefreshSubject = null;
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.tokenRefreshSubject = null;
        this.logout();
        return throwError(() => error);
      })
    );
  }

  public refreshUserData(): void {
    this.loadUserFromStorage();
  }

  public setTokens(token: string, refreshToken: string) {
    if (token && token.includes('.')) { 
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refreshToken);
      this.loadUserFromToken(token);
      
      // Forzar recarga de datos del usuario
      setTimeout(() => {
        this.refreshUserData();
      }, 1000);
    } else {
      console.warn('Token inválido, no se guardó');
    }
  }

  private loadUserFromToken(token: string) {
    try {
      if (!token || !token.includes('.')) throw new Error('Token inválido');
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Crear objeto con datos del token
      const tokenData: Partial<User> = {
        id: payload.id,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        profile_image: payload.profile_image,
        username: payload.username,
        role: payload.role,
        created_at: payload.created_at
      };
      
      // Combinar con usuario existente
      const currentUser = this._currentUser() || {};
      const mergedUser = { ...currentUser, ...tokenData };
      
      this._currentUser.set(mergedUser as User);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(mergedUser));
      }
    } catch (e) {
      console.error('Error parsing token', e);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    }
  }

  public loadUserFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          this._currentUser.set({
            id: parsedUser.id,
            email: parsedUser.email,
            first_name: parsedUser.first_name,
            last_name: parsedUser.last_name,
            profile_image: parsedUser.profile_image || null,
            username: parsedUser.username,
            created_at: parsedUser.created_at
          } as User);
        } catch (e) {
          console.error('Error parsing saved user', e);
          this.logout();
        }
      }
    }
  }

  // Método para obtener los headers de autenticación
  getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  updateUserProfile(updatedUser: User): void {
    // Guardar en localStorage primero
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // Actualizar la señal DESPUÉS de localStorage
    this._currentUser.set(updatedUser);
  }
  
  updateUserProfileImage(imageUrl: string | null): void {
    const current = this._currentUser();
    if (current) {
      this._currentUser.set({ 
        ...current, 
        profile_image: imageUrl 
      });
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('currentUser', JSON.stringify(this._currentUser()));
      }
    }
  }
}
