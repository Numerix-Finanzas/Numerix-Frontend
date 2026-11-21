import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CronogramaCliente } from '../../../core/models';
import { mensajeError } from '../../../core/util';
import { EstadoComponent } from '../../../shared/estado.component';
import { MontoPipe } from '../../../shared/monto.pipe';
import { ConsultaClienteBase } from '../selector-cliente';

// GET /clientes/{id}/cronograma: un cronograma (método francés) por cada compra en cuotas del cliente
@Component({
  selector: 'app-cronograma',
  standalone: true,
  imports: [FormsModule, DatePipe, EstadoComponent, MontoPipe],
  templateUrl: './cronograma.component.html'
})
export class CronogramaComponent extends ConsultaClienteBase implements OnInit {
  datos: CronogramaCliente | null = null;

  ngOnInit(): void {
    this.iniciarSelector();
  }

  protected consultar(): void {
    this.cargando = true;
    this.clienteService.cronograma(this.idCliente).subscribe({
      next: (d) => {
        this.datos = d;
        this.cargando = false;
      },
      error: (err) => {
        this.datos = null;
        this.cargando = false;
        this.error = mensajeError(err);
      }
    });
  }

  protected limpiar(): void {
    this.datos = null;
  }
}
