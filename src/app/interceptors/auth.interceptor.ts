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
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

// Estado compartido del interceptor
let interceptorState = {
  isRefreshing: false,
  refreshTokenSubject: new BehaviorSubject<string | null>(null)
};

// Definir rutas públicas (basado en las rutas de tu aplicación)
const PUBLIC_PATHS = [
  '/playlist/',
  '/artist/',
  '/buscar',
  '/', // raíz
  '/registrarse',
  '/login',
  '/reset-password'
];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ignorar solicitudes de assets
  if (req.url.includes('assets/')) {
    return next(req);
  }

  const token = authService.getToken();
  let authReq = req;

  // Agregar token si existe
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Determinar si es una ruta pública
      const isPublic = PUBLIC_PATHS.some(path => req.url.includes(path));
      
      if (error.status === HttpStatusCode.Unauthorized || 
          error.status === HttpStatusCode.Forbidden) {
        
        // No redirigir si no hay token o es ruta pública
        if (!token || isPublic) {
          return throwError(() => error);
        }
        
        // Manejar error de autenticación para rutas privadas
        return handleAuthError(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function handleAuthError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  const state = interceptorState;

  if (state.isRefreshing) {
    return state.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return retryRequest(req, token, next);
      })
    );
  }

  state.isRefreshing = true;
  state.refreshTokenSubject.next(null);

  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No refresh token'));
  }

  return authService.refreshToken().pipe(
    switchMap((tokens: any) => {
      authService.setTokens(tokens.token, tokens.refreshToken);
      state.isRefreshing = false;
      state.refreshTokenSubject.next(tokens.token);
      return retryRequest(req, tokens.token, next);
    }),
    catchError((err) => {
      state.isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => err);
    })
  );
}

function retryRequest(
  req: HttpRequest<unknown>,
  token: string,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const newRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(newRequest);
}