import { Component, OnInit, inject } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../../core/api.services';
import { Cliente, Estado } from '../../../core/models';
import { mensajeError } from '../../../core/util';
import { EstadoComponent } from '../../../shared/estado.component';
import { MontoPipe } from '../../../shared/monto.pipe';

@Component({
  selector: 'app-cliente-listado',
  standalone: true,
  imports: [RouterLink, LowerCasePipe, EstadoComponent, MontoPipe],
  template: `
    <h1 class="titulo">Listado de clientes</h1>
    @if (error) { <p class="alerta alerta-error centrado">{{ error }}</p> }
    <div class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>Documento</th><th>Cliente</th><th>Límite</th><th>Crédito disponible</th>
            <th>Tasa</th><th>Corte / Pago</th><th>Máx. meses</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (c of clientes; track c.idCliente) {
            <tr>
              <td class="codigo">{{ c.tipoDocumentoCliente }} {{ c.numeroDocumentoCliente }}</td>
              <td>{{ c.nombreCliente }}</td>
              <td>{{ c.limiteCredito | monto: c.moneda }}</td>
              <td>{{ c.creditoDisponible | monto: c.moneda }}</td>
              <td>{{ c.tipoTasa }} {{ c.periodoTasa | lowercase }} {{ c.porcentajeTasa }}%</td>
              <td>Día {{ c.diaCorte }} / día {{ c.diaPagoPactado }}</td>
              <td>{{ c.maximoMesesCredito }}</td>
              <td>
                <app-estado [estado]="c.estadoCliente" [editable]="true" [ocupado]="ocupado === c.idCliente"
                            (cambiar)="cambiarEstado(c, $event)"></app-estado>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vacio">{{ cargando ? 'Cargando...' : 'No hay clientes registrados.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
    <div class="acciones-centro">
      <a class="btn btn-grande" routerLink="/negocio/clientes/registro">Registrar un cliente</a>
    </div>
  `
})
export class ClienteListadoComponent implements OnInit {
  private clienteService = inject(ClienteService);
  clientes: Cliente[] = [];
  cargando = true;
  ocupado: string | null = null;
  error = '';

  ngOnInit(): void {
    this.clienteService.listar().subscribe({
      next: (lista) => {
        this.clientes = lista;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeError(err);
      }
    });
  }

  cambiarEstado(cliente: Cliente, estado: Estado): void {
    this.error = '';
    this.ocupado = cliente.idCliente;
    this.clienteService.cambiarEstado(cliente.idCliente, estado).subscribe({
      next: (c) => {
        Object.assign(cliente, c);
        this.ocupado = null;
      },
      error: (err) => {
        this.ocupado = null;
        this.error = mensajeError(err);
      }
    });
  }
}
