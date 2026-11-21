import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NegocioService } from '../../../core/api.services';
import { Estado, Negocio } from '../../../core/models';
import { mensajeError } from '../../../core/util';
import { EstadoComponent } from '../../../shared/estado.component';

@Component({
  selector: 'app-negocio-listado',
  standalone: true,
  imports: [RouterLink, EstadoComponent],
  template: `
    <h1 class="titulo">Listado de negocios</h1>
    @if (error) { <p class="alerta alerta-error centrado">{{ error }}</p> }
    <div class="tabla-contenedor">
      <table class="tabla tabla-oscura">
        <thead>
          <tr>
            <th>Nombre de negocio</th><th>RUC</th><th>Tipo</th><th>Nombre administrador</th><th>Usuario</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (n of negocios; track n.idNegocio) {
            <tr>
              <td>{{ n.nombreNegocio }}</td>
              <td>{{ n.rucNegocio }}</td>
              <td>{{ n.tipoNegocio }}</td>
              <td>{{ n.nombreAdministradorNegocio }}</td>
              <td>{{ n.usuario }}</td>
              <td>
                <app-estado [estado]="n.estadoNegocio" [editable]="true" [ocupado]="ocupado === n.idNegocio"
                            (cambiar)="cambiarEstado(n, $event)"></app-estado>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="vacio">{{ cargando ? 'Cargando...' : 'No hay negocios registrados.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
    <div class="acciones-centro">
      <a class="btn btn-grande" routerLink="/admin/negocios/registro">Registrar un negocio</a>
    </div>
  `
})
export class NegocioListadoComponent implements OnInit {
  private negocioService = inject(NegocioService);
  negocios: Negocio[] = [];
  cargando = true;
  ocupado: string | null = null;
  error = '';

  ngOnInit(): void {
    this.negocioService.listar().subscribe({
      next: (lista) => {
        this.negocios = lista;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeError(err);
      }
    });
  }

  cambiarEstado(negocio: Negocio, estado: Estado): void {
    this.error = '';
    this.ocupado = negocio.idNegocio;
    this.negocioService.cambiarEstado(negocio.idNegocio, estado).subscribe({
      next: (n) => {
        Object.assign(negocio, n);
        this.ocupado = null;
      },
      error: (err) => {
        this.ocupado = null;
        this.error = mensajeError(err);
      }
    });
  }
}
