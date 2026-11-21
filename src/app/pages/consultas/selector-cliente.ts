import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ClienteService } from '../../core/api.services';
import { Cliente } from '../../core/models';
import { mensajeError } from '../../core/util';

/*
 Base de las pantallas de consulta (Cronograma, Movimientos y Reporte de deuda).
 - AdminNegocio: elige el cliente de un combo (GET /clientes).
 - Cliente: solo ve su propia información (idCliente de la sesión), sin combo.
 */
export abstract class ConsultaClienteBase {
  protected auth = inject(AuthService);
  protected clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);

  readonly esCliente = this.auth.rol() === 'Cliente';
  clientes: Cliente[] = [];
  idCliente = '';
  cliente: Cliente | null = null;
  error = '';
  cargando = false;

  protected iniciarSelector(): void {
    if (this.esCliente) {
      this.idCliente = this.auth.idCliente() ?? '';
      this.alCambiarCliente();
    } else {
      this.clienteService.listar().subscribe({
        next: (lista) => {
          this.clientes = lista;
          // ?cliente=CLI-... (por ejemplo, desde "Ver cronograma" al registrar una compra)
          const desdeUrl = this.route.snapshot.queryParamMap.get('cliente');
          if (desdeUrl && lista.some((c) => c.idCliente === desdeUrl)) {
            this.idCliente = desdeUrl;
            this.alCambiarCliente();
          }
        },
        error: (err) => (this.error = mensajeError(err))
      });
    }
  }

  alCambiarCliente(): void {
    this.error = '';
    this.cliente = this.clientes.find((c) => c.idCliente === this.idCliente) ?? null;
    if (!this.idCliente) {
      this.limpiar();
      return;
    }
    if (!this.cliente) {
      // El rol Cliente no puede listar clientes, pero sí consultar su propio registro
      this.clienteService.buscar(this.idCliente).subscribe({
        next: (c) => (this.cliente = c),
        error: () => {}
      });
    }
    this.consultar();
  }

  get moneda(): string {
    return this.cliente?.moneda ?? 'PEN';
  }

  protected abstract consultar(): void;
  protected abstract limpiar(): void;
}
