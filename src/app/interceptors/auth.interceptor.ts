import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn, 
  HttpEvent, 
  HttpErrorResponse, 
  HttpStatusCode 
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/app/services/auth/auth.service';
import { catchError, switchMap, throwError, Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No interceptar solicitudes de autenticación
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Clonar la solicitud y añadir el token si está disponible
  const authReq = addTokenToRequest(req, authService.getToken());

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejar errores 401 (No autorizado)
      if (error.status === HttpStatusCode.Unauthorized) {
        return handleUnauthorizedError(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

// Función auxiliar para añadir token a la solicitud
function addTokenToRequest(
  req: HttpRequest<unknown>, 
  token: string | null
): HttpRequest<unknown> {
  return token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
}

// Función para manejar errores 401
function handleUnauthorizedError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  // Si no hay token, redirigir a login
  if (!authService.getToken()) {
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No autenticado'));
  }

  // Intentar refrescar el token
  return authService.refreshToken().pipe(
    switchMap(() => {
      // Reintentar la solicitud original con el nuevo token
      const newToken = authService.getToken();
      const newRequest = addTokenToRequest(req, newToken);
      return next(newRequest);
    }),
    catchError((refreshError) => {
      // Si falla el refresco, cerrar sesión
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => refreshError);
    })
  );
}