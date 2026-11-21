import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './models';

// Solo deja entrar si hay sesión válida y el rol coincide con el de la sección
export function rolGuard(rol: Rol): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.estaAutenticado()) {
      return router.parseUrl('/login');
    }
    if (auth.rol() !== rol) {
      return router.parseUrl(auth.rutaInicio());
    }
    return true;
  };
}

// La pantalla de login redirige al inicio si ya hay sesión
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? router.parseUrl(auth.rutaInicio()) : true;
};
