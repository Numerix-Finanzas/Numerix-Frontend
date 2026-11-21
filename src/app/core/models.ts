// Interfaces que corresponden a los DTOs del backend (paquete com.upc.numerix.dtos)

export type Rol = 'AdminSistema' | 'AdminNegocio' | 'Cliente';
export type Estado = 'Activo' | 'Inactivo';

// ---------- Seguridad ----------
export interface AuthRequest {
  usuario: string;
  contrasena: string;
  recordarContrasena: boolean;
}

export interface AuthResponse {
  autenticacionValida: boolean;
  jwt: string;
  roles: string[];
  rolUsuario: Rol;
  usuario: string;
  nombreCompleto: string;
  idNegocio: string | null;
  nombreNegocio: string | null;
  idCliente: string | null;
  recordarContrasena: boolean;
}

export interface ErrorApi {
  estadoOperacion: string | null;
  mensaje: string;
  errores: Record<string, string> | null;
}

// ---------- Administrador del sistema ----------
export interface DashboardAdmin {
  totalNegocios: number;
  totalNegociosActivos: number;
  totalNegociosInactivos: number;
}

export interface Negocio {
  idNegocio: string;
  nombreNegocio: string;
  rucNegocio: string;
  tipoNegocio: string;
  estadoNegocio: Estado;
  nombreAdministradorNegocio: string;
  correoElectronico: string;
  usuario: string;
  fechaRegistro: string;
}

export interface NegocioRequest {
  nombreNegocio: string;
  rucNegocio: string;
  tipoNegocio: string;
  nombreAdministradorNegocio: string;
  correoElectronico: string;
  usuario: string;
  contrasena: string;
}

// ---------- Productos ----------
export type ModalidadVenta = 'Contado' | 'Crédito' | 'Ambas';

export interface Producto {
  idProducto: string;
  descripcionProducto: string;
  marcaProducto: string | null;
  proveedorProducto: string | null;
  unidadMedida: string;
  imagenProducto: string | null;
  precioContado: number;
  precioCredito: number;
  modalidadVentaProducto: ModalidadVenta;
  estadoProducto: Estado;
  fechaRegistro: string;
}

export interface ProductoRequest {
  descripcionProducto: string;
  marcaProducto: string | null;
  proveedorProducto: string | null;
  unidadMedida: string;
  imagenProducto: string | null;
  precioContado: number;
  precioCredito: number;
  modalidadVentaProducto: ModalidadVenta;
  estadoProducto: Estado;
}

// ---------- Clientes ----------
export interface Cliente {
  idCliente: string;
  nombreCliente: string;
  tipoDocumentoCliente: 'DNI' | 'CE' | 'RUC';
  numeroDocumentoCliente: string;
  estadoCliente: Estado;
  moneda: 'PEN' | 'USD';
  limiteCredito: number;
  creditoUtilizado: number;
  creditoDisponible: number;
  tipoTasa: 'Efectiva' | 'Nominal';
  porcentajeTasa: number;
  tipoTasaMoratoria: 'Efectiva' | 'Nominal';
  porcentajeTasaMoratoria: number;
  periodoTasa: string;
  periodoCapitalizacion: number;
  diaCorte: number;
  diaPagoPactado: number;
  maximoMesesCredito: number;
  tedCompensatoria: number;
  temCompensatoria: number;
  tedMoratoria: number;
  fechaRegistro: string;
}

export interface ClienteRequest {
  nombreCliente: string;
  tipoDocumentoCliente: string;
  numeroDocumentoCliente: string;
  moneda: string;
  limiteCredito: number;
  tipoTasa: string;
  porcentajeTasa: number;
  tipoTasaMoratoria: string;
  porcentajeTasaMoratoria: number;
  periodoTasa: string;
  periodoCapitalizacion: number;
  diaCorte: number;
  diaPagoPactado: number;
  maximoMesesCredito: number;
}

export interface ClienteRegistrado {
  mensaje: string;
  cliente: Cliente;
  usuario: string;
  contrasena: string;
}

// ---------- Compras ----------
export type TipoPago = 'Un solo pago' | 'Cuotas';

// Línea de la compra que se envía (DetalleCompraRequestDTO)
export interface DetalleCompraRequest {
  idProducto: string;
  cantidadProducto: number;
}

// Línea de la compra que devuelve el backend (DetalleCompraDTO)
export interface DetalleCompra {
  idProducto: string;
  descripcionProducto: string;
  cantidadProducto: number;
  precioCredito: number;
  subtotal: number;
}

export interface CompraRequest {
  idCliente: string;
  detalles: DetalleCompraRequest[];
  tipoPago: TipoPago;
  numeroCuotas: number;
  fechaCompra: string | null;
}

export interface CompraResultado {
  estadoOperacion: string;
  mensaje: string;
  idCompra: string | null;
  idObligacion: string | null;
  idCliente: string;
  nombreCliente: string;
  descripcionProducto: string;      // productos separados por comas
  moneda: string;
  fechaCompra: string;
  cantidadProducto: number;         // unidades en total
  detalles: DetalleCompra[];
  montoCompra: number;
  tipoPago: TipoPago;
  numeroCuotas: number;
  limiteCredito: number;
  deudaActual: number;
  creditoDisponible: number;
  creditoDisponibleDespues: number;
  tedCompensatoria: number;
  temCompensatoria: number;
  fechaPagoPactada: string;
  proximaFechaPago: string;
  diasOperacion: number | null;
  interesCompensatorioDeuda: number | null;
  montoTotalPagar: number | null;
  diasGracia: number | null;
  factorCapitalizacion: number | null;
  capitalActualizado: number | null;
  montoCuota: number | null;
}

// Fila de Movimientos - Compras
export interface CompraMovimiento {
  idCompra: string;
  idObligacion: string;
  fechaCompra: string;
  descripcionProducto: string;
  cantidadProducto: number;
  detalles: DetalleCompra[] | null;
  tipoPago: TipoPago;
  numeroCuotas: number;
  montoCompra: number;
  estadoDeuda: string;
}

// ---------- Cronograma ----------
export interface Cuota {
  idCuota: number;
  numeroPeriodo: number;
  fechaVencimientoPeriodo: string;
  saldoInicialPeriodo: number;
  interesPeriodo: number;
  amortizacionPeriodo: number;
  cuotaPeriodo: number;
  saldoFinalPeriodo: number;
  estadoCuota: string;
  fechaPagoReal: string | null;
}

export interface Cronograma {
  idCompra: string;
  idObligacion: string;
  idCliente: string;
  nombreCliente: string;
  descripcionProducto: string;
  moneda: string;
  fechaCompra: string;
  montoCompra: number;
  tipoPago: TipoPago;
  numeroCuotas: number;
  totalPeriodosAmortizacion: number;
  tedCompensatoria: number;
  temCompensatoria: number;
  diasGracia: number;
  factorCapitalizacion: number;
  capitalActualizado: number;
  montoCuota: number;
  cuotasPagadas: number;
  totalInteres: number;
  totalAmortizacion: number;
  totalCuotas: number;
  proximaFechaPago: string | null;
  estadoDeuda: string;
  cuotas: Cuota[];
}

export interface CronogramaCliente {
  idCliente: string;
  nombreCliente: string;
  proximaFechaPago: string | null;
  cronogramas: Cronograma[];
}

// ---------- Pagos ----------
export interface ObligacionPendiente {
  idCuota: number;
  idObligacion: string;
  idCompra: string;
  descripcionProducto: string;
  fechaCompra: string;
  tipoPago: TipoPago;
  numeroPeriodo: number;
  numeroCuotas: number;
  fechaPagoPactada: string;
  deudaVencida: number;
  estadoCuota: string;
}

export interface PagoSimulacion {
  idCuota: number;
  idObligacion: string;
  idCompra: string;
  descripcionProducto: string;
  numeroPeriodo: number;
  moneda: string;
  fechaPagoPactada: string;
  fechaPagoReal: string;
  diasMora: number;
  diasAnticipacion: number;
  deudaVencida: number;
  capitalPendienteDeuda: number;
  interesCompensatorioDeuda: number;
  interesMoratorioObligacion: number;
  montoTotalObligacion: number;
  ordenPrelacion: string;
}

export interface PagoRequest {
  idCuota: number;
  fechaPagoReal: string | null;
  montoPagado: number;
}

export interface Pago {
  estadoOperacion: string;
  mensaje: string;
  idPago: string;
  idObligacion: string;
  idCompra: string;
  idCuota: number;
  numeroPeriodo: number;
  descripcionProducto: string;
  fechaPagoReal: string;
  diasMora: number;
  diasAnticipacion: number;
  montoImputadoMora: number;
  montoImputadoInteres: number;
  montoImputadoCapital: number;
  montoPagado: number;
  estadoDeuda: string;
  creditoDisponible: number | null;
}

// ---------- Reporte de deuda ----------
export interface Deuda {
  fechaCompra: string;
  idCompra: string;
  idObligacion: string;
  idCuota: number | null;
  numeroPeriodo: number | null;
  numeroCuotas: number | null;
  descripcionProducto: string;
  fechaPagoPactada: string;
  diasMora: number;
  capitalPendienteDeuda: number;
  interesCompensatorioDeuda: number;
  interesMoratorioDeuda: number;
  montoTotalDeuda: number;
  estadoDeuda: string;
}

export interface ReporteDeuda {
  idCliente: string;
  numeroDocumentoCliente: string;
  nombreCliente: string;
  moneda: string;
  limiteCredito: number;
  creditoUtilizado: number;
  creditoDisponible: number;
  fechaConsulta: string;
  proximaFechaPago: string | null;
  diaCorte: number;
  diaPagoPactado: number;
  cantidadObligacionesPendientes: number;
  deudas: Deuda[];
  capitalTotal: number;
  interesCompensatorioTotal: number;
  interesMoratorioTotal: number;
  montoTotalPagar: number;
}
