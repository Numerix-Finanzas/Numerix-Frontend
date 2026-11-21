import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Agrega "Authorization: Bearer <jwt>" a las llamadas al backend.
// Si el backend responde 401 (token vencido o inválido) se cierra la sesión.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esLogin = req.url.endsWith('/authenticate');
  const token = auth.token();

  if (token && !esLogin && req.url.startsWith(environment.apiUrl)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esLogin) {
        auth.logout(true);
      }
      return throwError(() => err);
    })
  );
};
