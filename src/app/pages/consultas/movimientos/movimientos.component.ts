import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraMovimiento, Pago } from '../../../core/models';
import { mensajeError } from '../../../core/util';
import { EstadoComponent } from '../../../shared/estado.component';
import { MontoPipe } from '../../../shared/monto.pipe';
import { ConsultaClienteBase } from '../selector-cliente';

// Movimientos del cliente: GET /clientes/{id}/compras y /clientes/{id}/pagos con rango de fechas opcional
@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [FormsModule, DatePipe, EstadoComponent, MontoPipe],
  templateUrl: './movimientos.component.html'
})
export class MovimientosComponent extends ConsultaClienteBase implements OnInit {
  vista: 'compras' | 'pagos' = 'compras';
  desde = '';
  hasta = '';
  compras: CompraMovimiento[] = [];
  pagos: Pago[] = [];
  consultado = false;

  ngOnInit(): void {
    this.iniciarSelector();
  }

  cambiarVista(vista: 'compras' | 'pagos'): void {
    this.vista = vista;
    if (this.idCliente) {
      this.consultar();
    }
  }

  alCambiarFechas(): void {
    if (this.idCliente) {
      this.consultar();
    }
  }

  protected consultar(): void {
    this.error = '';
    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.error = 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".';
      return;
    }
    this.cargando = true;
    const fallo = (err: unknown) => {
      this.cargando = false;
      this.error = mensajeError(err);
    };
    if (this.vista === 'compras') {
      this.clienteService.movimientosCompras(this.idCliente, this.desde, this.hasta).subscribe({
        next: (l) => {
          this.compras = l;
          this.cargando = false;
          this.consultado = true;
        },
        error: fallo
      });
    } else {
      this.clienteService.movimientosPagos(this.idCliente, this.desde, this.hasta).subscribe({
        next: (l) => {
          this.pagos = l;
          this.cargando = false;
          this.consultado = true;
        },
        error: fallo
      });
    }
  }

  protected limpiar(): void {
    this.compras = [];
    this.pagos = [];
    this.consultado = false;
  }

  get mensajeVacio(): string {
    if (this.cargando) {
      return 'Cargando...';
    }
    if (!this.idCliente) {
      return 'Seleccione un cliente.';
    }
    return this.vista === 'compras' ? 'No hay compras en el periodo.' : 'No hay pagos en el periodo.';
  }
}
