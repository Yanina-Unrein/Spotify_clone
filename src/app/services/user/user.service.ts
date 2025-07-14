import { environment } from '@/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { EmailUpdateResponse, User } from '@/app/models/UserModel';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;
  private http = inject(HttpClient);
  
  constructor(private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/perfil`, { 
      headers: this.getAuthHeaders() 
    }).pipe(catchError(this.handleError));
  }

  // Actualiza nombre y apellido
  updateName(data: { first_name?: string; last_name?: string }): Observable<User> {
    const updateData: any = {};
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    
    return this.http.put<User>(`${this.apiUrl}/perfil/nombre`, updateData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(updatedUser => {
        this.authService.updateUserProfile(updatedUser);
      })
    );
  }

  // Actualiza el email
  updateEmail(data: { email: string }): Observable<EmailUpdateResponse> {
    return this.http.put<{ user: User; token: string }>(
      `${this.apiUrl}/perfil/email`, 
      data,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        // Actualizar token y usuario
        localStorage.setItem('token', response.token);
        this.authService.updateUserProfile(response.user);
      })
    );
  }

  changePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/password`, passwordData, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  uploadProfileImage(imageFile: File): Observable<{ profile_image: string }> {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    // IMPORTANTE: No establecer el Content-Type manualmente para FormData
    return this.http.post<{ profile_image: string }>(
      `${this.apiUrl}/perfil/image`, 
      formData, 
      { 
        headers: this.getAuthHeaders()
      }
    ).pipe(
      tap(response => {
        this.authService.updateUserProfileImage(response.profile_image);
      }),
      catchError(this.handleError)
    );
  }

  removeProfileImage(): Observable<{ profile_image: null }> {
    return this.http.delete<{ profile_image: null }>(
      `${this.apiUrl}/perfil/image`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        this.authService.updateUserProfileImage(null);
      }),
      catchError(error => {
        // Manejar específicamente errores 403
        if (error.status === 403) {
          return throwError(() => new Error('No tienes permiso para esta acción'));
        }
        return throwError(() => error);
      })
    );
  }

  deleteAccount(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/eliminar-cuenta`,
      { headers: this.getAuthHeaders() }  // Añadir headers de autenticación
    ).pipe(
      tap(() => {
        this.authService.logout();
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en UserService:', error);
    
    let errorMessage = 'Error de servidor';
    if (error.status === 403) {
      errorMessage = 'Acceso prohibido. Tu sesión ha expirado.';
    } else if (error.status === 401) {
      errorMessage = 'No autenticado. Por favor inicia sesión nuevamente.';
    } else if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => errorMessage);
  }
}
