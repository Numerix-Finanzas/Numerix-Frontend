import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NegocioService } from '../../../core/api.services';
import { DashboardAdmin } from '../../../core/models';
import { mensajeError } from '../../../core/util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1 class="titulo">Numerix</h1>
    @if (error) {
      <p class="alerta alerta-error centrado">{{ error }}</p>
    }
    <div class="dashboard">
      <a class="tarjeta-dato total" routerLink="/admin/negocios">
        <span class="tarjeta-dato-titulo">Total de negocios</span>
        <span class="tarjeta-dato-valor">{{ datos?.totalNegocios ?? '—' }}</span>
      </a>
      <div class="dashboard-fila">
        <a class="tarjeta-dato" routerLink="/admin/negocios">
          <span class="tarjeta-dato-titulo">Negocios activos</span>
          <span class="tarjeta-dato-valor">{{ datos?.totalNegociosActivos ?? '—' }}</span>
        </a>
        <a class="tarjeta-dato" routerLink="/admin/negocios">
          <span class="tarjeta-dato-titulo">Negocios inactivos</span>
          <span class="tarjeta-dato-valor">{{ datos?.totalNegociosInactivos ?? '—' }}</span>
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private negocioService = inject(NegocioService);
  datos: DashboardAdmin | null = null;
  error = '';

  ngOnInit(): void {
    this.negocioService.dashboard().subscribe({
      next: (d) => (this.datos = d),
      error: (err) => (this.error = mensajeError(err))
    });
  }
}
