import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRequest, AuthResponse, Rol } from './models';

const CLAVE_SESION = 'numerix.sesion';
const CLAVE_USUARIO_RECORDADO = 'numerix.usuario';

/*
 Inicio de sesión con JWT (POST /api/authenticate).
 Con "Recordar contraseña" la sesión se guarda en localStorage (el backend da un token de 7 días);
 sin marcarlo se guarda en sessionStorage y se pierde al cerrar el navegador.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly url = `${environment.apiUrl}/authenticate`;
  private readonly sesionActual = signal<AuthResponse | null>(this.leerSesion());

  readonly sesion = this.sesionActual.asReadonly();
  readonly rol = computed<Rol | null>(() => this.sesionActual()?.rolUsuario ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.url, request).pipe(
      tap((resp) => {
        const almacen = request.recordarContrasena ? localStorage : sessionStorage;
        localStorage.removeItem(CLAVE_SESION);
        sessionStorage.removeItem(CLAVE_SESION);
        almacen.setItem(CLAVE_SESION, JSON.stringify(resp));
        if (request.recordarContrasena) {
          localStorage.setItem(CLAVE_USUARIO_RECORDADO, resp.usuario);
        } else {
          localStorage.removeItem(CLAVE_USUARIO_RECORDADO);
        }
        this.sesionActual.set(resp);
      })
    );
  }

  logout(sesionExpirada = false): void {
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
    this.sesionActual.set(null);
    this.router.navigate(['/login'], sesionExpirada ? { queryParams: { expirada: 1 } } : {});
  }

  usuarioRecordado(): string {
    return localStorage.getItem(CLAVE_USUARIO_RECORDADO) ?? '';
  }

  token(): string | null {
    return this.sesionActual()?.jwt ?? null;
  }

  idCliente(): string | null {
    return this.sesionActual()?.idCliente ?? null;
  }

  estaAutenticado(): boolean {
    const token = this.token();
    if (!token) {
      return false;
    }
    if (this.tokenExpirado(token)) {
      localStorage.removeItem(CLAVE_SESION);
      sessionStorage.removeItem(CLAVE_SESION);
      this.sesionActual.set(null);
      return false;
    }
    return true;
  }

  // Página de inicio según el rol de la cuenta
  rutaInicio(): string {
    switch (this.rol()) {
      case 'AdminSistema':
        return '/admin/inicio';
      case 'AdminNegocio':
        return '/negocio/productos';
      case 'Cliente':
        return '/cliente/cronograma';
      default:
        return '/login';
    }
  }

  private leerSesion(): AuthResponse | null {
    const texto = localStorage.getItem(CLAVE_SESION) ?? sessionStorage.getItem(CLAVE_SESION);
    if (!texto) {
      return null;
    }
    try {
      return JSON.parse(texto) as AuthResponse;
    } catch {
      return null;
    }
  }

  // Lee el campo "exp" del JWT (segundos desde 1970)
  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
