import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from './models';

// Mensaje legible a partir de la respuesta de error del backend (ErrorDTO)
export function mensajeError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución (http://localhost:8080).';
    }
    const cuerpo = err.error as Partial<ErrorApi> | null;
    if (cuerpo && typeof cuerpo === 'object' && cuerpo.mensaje) {
      return cuerpo.mensaje;
    }
    if (err.status === 403) {
      return 'No tiene permiso para realizar esta operación.';
    }
    return `Error ${err.status}: no se pudo completar la operación.`;
  }
  return 'Ocurrió un error inesperado.';
}

// Errores por campo (respuesta 400 con "errores")
export function erroresCampo(err: unknown): Record<string, string> {
  if (err instanceof HttpErrorResponse && err.error && typeof err.error === 'object') {
    return (err.error as ErrorApi).errores ?? {};
  }
  return {};
}

// Fecha actual (zona del navegador) en formato YYYY-MM-DD, que es el que espera el backend
export function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Quita las propiedades vacías antes de enviarlas como parámetros de consulta
export function limpiarParams(params: Record<string, string | null | undefined>): Record<string, string> {
  const res: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') {
      res[k] = v;
    }
  });
  return res;
}
