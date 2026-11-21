import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, catchError, debounceTime, of, switchMap } from 'rxjs';
import { ClienteService, PagoService } from '../../../core/api.services';
import { Cliente, ObligacionPendiente, Pago, PagoSimulacion } from '../../../core/models';
import { hoyISO, mensajeError } from '../../../core/util';
import { ModalComponent } from '../../../shared/modal.component';
import { MontoPipe } from '../../../shared/monto.pipe';

/*
 Registro de pago: se elige el cliente y la obligación (cuota) pendiente.
 GET /pagos/simular calcula mora, interés, capital y total para la fecha real de pago.
 El backend no acepta pagos parciales, así que se envía exactamente el total calculado.
 */
@Component({
  selector: 'app-pago-registro',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, ModalComponent, MontoPipe],
  templateUrl: './pago-registro.component.html'
})
export class PagoRegistroComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private pagoService = inject(PagoService);
  private suscripciones: Subscription[] = [];

  form = this.fb.nonNullable.group({
    idCliente: ['', Validators.required],
    idCuota: [null as number | null, Validators.required],
    fechaPagoReal: [hoyISO(), Validators.required]
  });

  clientes: Cliente[] = [];
  obligaciones: ObligacionPendiente[] = [];
  simulacion: PagoSimulacion | null = null;
  avisoSimulacion = '';
  guardando = false;
  error = '';
  registrado: Pago | null = null;

  ngOnInit(): void {
    this.clienteService.listar().subscribe({
      next: (lista) => (this.clientes = lista),
      error: (err) => (this.error = mensajeError(err))
    });

    this.suscripciones.push(
      this.form.controls.idCliente.valueChanges.subscribe((id) => this.cargarObligaciones(id))
    );

    this.suscripciones.push(
      this.form.valueChanges.pipe(
        debounceTime(250),
        switchMap(() => {
          const { idCuota, fechaPagoReal } = this.form.getRawValue();
          this.avisoSimulacion = '';
          if (!idCuota || !fechaPagoReal) {
            return of(null);
          }
          return this.pagoService.simular(Number(idCuota), fechaPagoReal).pipe(
            catchError((err) => {
              this.avisoSimulacion = mensajeError(err);
              return of(null);
            })
          );
        })
      ).subscribe((s) => (this.simulacion = s))
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  get moneda(): string {
    return this.simulacion?.moneda ?? this.clientes.find((c) => c.idCliente === this.form.controls.idCliente.value)?.moneda ?? 'PEN';
  }

  get obligacionSeleccionada(): ObligacionPendiente | undefined {
    return this.obligaciones.find((o) => o.idCuota === Number(this.form.controls.idCuota.value));
  }

  etiquetaObligacion(o: ObligacionPendiente): string {
    const detalle = o.tipoPago === 'Cuotas' ? `Cuota ${o.numeroPeriodo}/${o.numeroCuotas}` : 'Un solo pago';
    return `${o.idCompra} · ${o.descripcionProducto} · ${detalle} · ${o.estadoCuota}`;
  }

  cargarObligaciones(idCliente: string): void {
    this.obligaciones = [];
    this.simulacion = null;
    this.form.controls.idCuota.setValue(null, { emitEvent: false });
    if (!idCliente) {
      return;
    }
    this.clienteService.obligacionesPendientes(idCliente).subscribe({
      next: (lista) => (this.obligaciones = lista),
      error: (err) => (this.error = mensajeError(err))
    });
  }

  registrar(): void {
    this.error = '';
    const { idCuota, fechaPagoReal } = this.form.getRawValue();
    if (this.form.invalid || !this.simulacion || !idCuota) {
      this.form.markAllAsTouched();
      this.error = 'Seleccione el cliente, la obligación y la fecha real de pago.';
      return;
    }
    this.guardando = true;
    this.pagoService.registrar({
      idCuota: Number(idCuota),
      fechaPagoReal,
      montoPagado: this.simulacion.montoTotalObligacion
    }).subscribe({
      next: (p) => {
        this.guardando = false;
        this.registrado = p;
      },
      error: (err) => {
        this.guardando = false;
        this.error = mensajeError(err);
      }
    });
  }

  cerrarConfirmacion(): void {
    this.registrado = null;
    this.cargarObligaciones(this.form.controls.idCliente.value);
  }
}
