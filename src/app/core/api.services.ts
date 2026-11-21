import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { limpiarParams } from './util';
import {
  Cliente, ClienteRegistrado, ClienteRequest, CompraMovimiento, CompraRequest, CompraResultado,
  Cronograma, CronogramaCliente, DashboardAdmin, Estado, Negocio, NegocioRequest, ObligacionPendiente,
  Pago, PagoRequest, PagoSimulacion, Producto, ProductoRequest, ReporteDeuda
} from './models';

const API = environment.apiUrl;

// ===== Administrador del sistema (NegocioController) =====
@Injectable({ providedIn: 'root' })
export class NegocioService {
  constructor(private http: HttpClient) {}

  dashboard(): Observable<DashboardAdmin> {
    return this.http.get<DashboardAdmin>(`${API}/admin/dashboard`);
  }

  listar(): Observable<Negocio[]> {
    return this.http.get<Negocio[]>(`${API}/negocios`);
  }

  registrar(request: NegocioRequest): Observable<Negocio> {
    return this.http.post<Negocio>(`${API}/negocios`, request);
  }

  cambiarEstado(idNegocio: string, estado: Estado): Observable<Negocio> {
    return this.http.put<Negocio>(`${API}/negocios/${idNegocio}/estado`, { estado });
  }
}

// ===== Productos (ProductoController) =====
@Injectable({ providedIn: 'root' })
export class ProductoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API}/productos`);
  }

  buscar(idProducto: string): Observable<Producto> {
    return this.http.get<Producto>(`${API}/productos/${idProducto}`);
  }

  registrar(request: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${API}/productos`, request);
  }

  modificar(idProducto: string, request: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${API}/productos/${idProducto}`, request);
  }

  cambiarEstado(idProducto: string, estado: Estado): Observable<Producto> {
    return this.http.put<Producto>(`${API}/productos/${idProducto}/estado`, { estado });
  }

  // multipart con el campo "archivo"; devuelve la ruta (/uploads/productos/...) para imagenProducto
  subirImagen(archivo: File): Observable<{ imagenProducto: string }> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<{ imagenProducto: string }>(`${API}/productos/imagen`, datos);
  }
}

// ===== Clientes y consultas (ClienteController) =====
@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${API}/clientes`);
  }

  buscar(idCliente: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${API}/clientes/${idCliente}`);
  }

  registrar(request: ClienteRequest): Observable<ClienteRegistrado> {
    return this.http.post<ClienteRegistrado>(`${API}/clientes`, request);
  }

  modificarCondiciones(idCliente: string, request: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${API}/clientes/${idCliente}`, request);
  }

  cambiarEstado(idCliente: string, estado: Estado): Observable<Cliente> {
    return this.http.put<Cliente>(`${API}/clientes/${idCliente}/estado`, { estado });
  }

  cronograma(idCliente: string): Observable<CronogramaCliente> {
    return this.http.get<CronogramaCliente>(`${API}/clientes/${idCliente}/cronograma`);
  }

  obligacionesPendientes(idCliente: string): Observable<ObligacionPendiente[]> {
    return this.http.get<ObligacionPendiente[]>(`${API}/clientes/${idCliente}/obligaciones-pendientes`);
  }

  reporteDeuda(idCliente: string, fecha?: string | null): Observable<ReporteDeuda> {
    return this.http.get<ReporteDeuda>(`${API}/clientes/${idCliente}/reporte-deuda`, {
      params: limpiarParams({ fecha })
    });
  }

  movimientosCompras(idCliente: string, desde?: string | null, hasta?: string | null): Observable<CompraMovimiento[]> {
    return this.http.get<CompraMovimiento[]>(`${API}/clientes/${idCliente}/compras`, {
      params: limpiarParams({ fechaInicioConsulta: desde, fechaFinConsulta: hasta })
    });
  }

  movimientosPagos(idCliente: string, desde?: string | null, hasta?: string | null): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${API}/clientes/${idCliente}/pagos`, {
      params: limpiarParams({ fechaInicioConsulta: desde, fechaFinConsulta: hasta })
    });
  }
}

// ===== Compras (CompraController) =====
@Injectable({ providedIn: 'root' })
export class CompraService {
  constructor(private http: HttpClient) {}

  simular(request: CompraRequest): Observable<CompraResultado> {
    return this.http.post<CompraResultado>(`${API}/compras/simular`, request);
  }

  registrar(request: CompraRequest): Observable<CompraResultado> {
    return this.http.post<CompraResultado>(`${API}/compras`, request);
  }

  cronograma(idCompra: string): Observable<Cronograma> {
    return this.http.get<Cronograma>(`${API}/compras/${idCompra}/cronograma`);
  }
}

// ===== Pagos (PagoController) =====
@Injectable({ providedIn: 'root' })
export class PagoService {
  constructor(private http: HttpClient) {}

  simular(idCuota: number, fechaPagoReal?: string | null): Observable<PagoSimulacion> {
    return this.http.get<PagoSimulacion>(`${API}/pagos/simular`, {
      params: limpiarParams({ idCuota: String(idCuota), fechaPagoReal })
    });
  }

  registrar(request: PagoRequest): Observable<Pago> {
    return this.http.post<Pago>(`${API}/pagos`, request);
  }
}
