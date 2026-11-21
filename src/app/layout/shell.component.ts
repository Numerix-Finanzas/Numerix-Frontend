import { Component, HostListener, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';

interface ItemMenu {
  etiqueta: string;
  ruta?: string;
  hijos?: { etiqueta: string; ruta: string }[];
}

// Barra superior + contenido. El menú cambia según el rol de la cuenta (mockups de cada módulo).
const MENUS: Record<string, ItemMenu[]> = {
  AdminSistema: [
    { etiqueta: 'Inicio', ruta: '/admin/inicio' },
    {
      etiqueta: 'Negocios',
      hijos: [
        { etiqueta: 'Registro de negocio', ruta: '/admin/negocios/registro' },
        { etiqueta: 'Listado de negocio', ruta: '/admin/negocios' }
      ]
    }
  ],
  AdminNegocio: [
    {
      etiqueta: 'Productos',
      hijos: [
        { etiqueta: 'Registro de productos', ruta: '/negocio/productos/registro' },
        { etiqueta: 'Listado de productos', ruta: '/negocio/productos' }
      ]
    },
    { etiqueta: 'Clientes', ruta: '/negocio/clientes' },
    { etiqueta: 'Compras', ruta: '/negocio/compras' },
    { etiqueta: 'Cronograma', ruta: '/negocio/cronograma' },
    { etiqueta: 'Pagos', ruta: '/negocio/pagos' },
    {
      etiqueta: 'Consultas',
      hijos: [
        { etiqueta: 'Movimientos', ruta: '/negocio/consultas/movimientos' },
        { etiqueta: 'Reporte de deuda', ruta: '/negocio/consultas/reporte-deuda' }
      ]
    }
  ],
  Cliente: [
    { etiqueta: 'Cronograma', ruta: '/cliente/cronograma' },
    { etiqueta: 'Movimientos', ruta: '/cliente/movimientos' },
    { etiqueta: 'Reporte de deuda', ruta: '/cliente/reporte-deuda' }
  ]
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <img class="barra-logo" src="img/logo.png" alt="Numerix">
      <nav class="barra-menu">
        @for (item of menu(); track item.etiqueta) {
          @if (item.hijos) {
            <div class="desplegable" [class.abierto]="abierto === item.etiqueta">
              <button type="button" class="btn-menu" (click)="alternar(item.etiqueta, $event)">
                {{ item.etiqueta }} <span class="flecha"></span>
              </button>
              <div class="desplegable-lista">
                @for (hijo of item.hijos; track hijo.ruta) {
                  <a [routerLink]="hijo.ruta" routerLinkActive="activo"
                     [routerLinkActiveOptions]="{ exact: true }">{{ hijo.etiqueta }}</a>
                }
              </div>
            </div>
          } @else {
            <a class="btn-menu" [routerLink]="item.ruta" routerLinkActive="activo">{{ item.etiqueta }}</a>
          }
        }
      </nav>
      <div class="barra-usuario">
        <span class="barra-nombre" [title]="sesion()?.nombreNegocio ?? ''">{{ sesion()?.nombreCompleto }}</span>
        <button type="button" class="btn-menu" (click)="salir()">Salir</button>
      </div>
    </header>
    <main class="contenido">
      <router-outlet></router-outlet>
    </main>
  `
})
export class ShellComponent {
  private auth = inject(AuthService);
  readonly sesion = this.auth.sesion;
  readonly menu = computed(() => MENUS[this.auth.rol() ?? ''] ?? []);
  abierto: string | null = null;

  constructor(router: Router) {
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => (this.abierto = null));
  }

  alternar(etiqueta: string, evento: Event): void {
    evento.stopPropagation();
    this.abierto = this.abierto === etiqueta ? null : etiqueta;
  }

  @HostListener('document:click')
  cerrarMenus(): void {
    this.abierto = null;
  }

  salir(): void {
    this.auth.logout();
  }
}
