import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteDeuda } from '../../../core/models';
import { hoyISO, mensajeError } from '../../../core/util';
import { EstadoComponent } from '../../../shared/estado.component';
import { MontoPipe } from '../../../shared/monto.pipe';
import { ConsultaClienteBase } from '../selector-cliente';

// GET /clientes/{id}/reporte-deuda?fecha=  (deuda a la fecha de consulta, con mora o descuento por prepago)
@Component({
  selector: 'app-reporte-deuda',
  standalone: true,
  imports: [FormsModule, DatePipe, EstadoComponent, MontoPipe],
  templateUrl: './reporte-deuda.component.html'
})
export class ReporteDeudaComponent extends ConsultaClienteBase implements OnInit {
  fechaConsulta = hoyISO();
  reporte: ReporteDeuda | null = null;

  ngOnInit(): void {
    this.iniciarSelector();
  }

  // Botón "Ver"
  ver(): void {
    if (!this.idCliente) {
      this.error = 'Seleccione un cliente.';
      return;
    }
    this.consultar();
  }

  protected consultar(): void {
    this.error = '';
    this.cargando = true;
    this.clienteService.reporteDeuda(this.idCliente, this.fechaConsulta || null).subscribe({
      next: (r) => {
        this.reporte = r;
        this.cargando = false;
      },
      error: (err) => {
        this.reporte = null;
        this.cargando = false;
        this.error = mensajeError(err);
      }
    });
  }

  protected limpiar(): void {
    this.reporte = null;
  }

  override get moneda(): string {
    return this.reporte?.moneda ?? this.cliente?.moneda ?? 'PEN';
  }
}
