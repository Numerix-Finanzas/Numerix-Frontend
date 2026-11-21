import { Routes } from '@angular/router';
import { loginGuard, rolGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { NegocioRegistroComponent } from './pages/admin/negocio-registro/negocio-registro.component';
import { NegocioListadoComponent } from './pages/admin/negocio-listado/negocio-listado.component';
import { ProductoRegistroComponent } from './pages/negocio/producto-registro/producto-registro.component';
import { ProductoListadoComponent } from './pages/negocio/producto-listado/producto-listado.component';
import { ClienteRegistroComponent } from './pages/negocio/cliente-registro/cliente-registro.component';
import { ClienteListadoComponent } from './pages/negocio/cliente-listado/cliente-listado.component';
import { CompraRegistroComponent } from './pages/negocio/compra-registro/compra-registro.component';
import { PagoRegistroComponent } from './pages/negocio/pago-registro/pago-registro.component';
import { CronogramaComponent } from './pages/consultas/cronograma/cronograma.component';
import { MovimientosComponent } from './pages/consultas/movimientos/movimientos.component';
import { ReporteDeudaComponent } from './pages/consultas/reporte-deuda/reporte-deuda.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard], title: 'Numerix | Iniciar sesión' },

  // Administrador del sistema
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [rolGuard('AdminSistema')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', component: DashboardComponent, title: 'Numerix | Inicio' },
      { path: 'negocios', component: NegocioListadoComponent, title: 'Numerix | Negocios' },
      { path: 'negocios/registro', component: NegocioRegistroComponent, title: 'Numerix | Registrar negocio' }
    ]
  },

  // Administrador del negocio
  {
    path: 'negocio',
    component: ShellComponent,
    canActivate: [rolGuard('AdminNegocio')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
      { path: 'productos', component: ProductoListadoComponent, title: 'Numerix | Productos' },
      { path: 'productos/registro', component: ProductoRegistroComponent, title: 'Numerix | Registro de productos' },
      { path: 'clientes', component: ClienteListadoComponent, title: 'Numerix | Clientes' },
      { path: 'clientes/registro', component: ClienteRegistroComponent, title: 'Numerix | Registrar cliente' },
      { path: 'compras', component: CompraRegistroComponent, title: 'Numerix | Compra a crédito' },
      { path: 'cronograma', component: CronogramaComponent, title: 'Numerix | Cronograma' },
      { path: 'pagos', component: PagoRegistroComponent, title: 'Numerix | Registrar pago' },
      { path: 'consultas/movimientos', component: MovimientosComponent, title: 'Numerix | Movimientos' },
      { path: 'consultas/reporte-deuda', component: ReporteDeudaComponent, title: 'Numerix | Reporte de deuda' }
    ]
  },

  // Cliente: solo consulta su propia información
  {
    path: 'cliente',
    component: ShellComponent,
    canActivate: [rolGuard('Cliente')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'cronograma' },
      { path: 'cronograma', component: CronogramaComponent, title: 'Numerix | Mi cronograma' },
      { path: 'movimientos', component: MovimientosComponent, title: 'Numerix | Mis movimientos' },
      { path: 'reporte-deuda', component: ReporteDeudaComponent, title: 'Numerix | Mi deuda' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
