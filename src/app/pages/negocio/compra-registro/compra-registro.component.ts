import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, catchError, debounceTime, merge, of, switchMap } from 'rxjs';
import { ClienteService, CompraService, ProductoService } from '../../../core/api.services';
import { Cliente, CompraRequest, CompraResultado, Producto, TipoPago } from '../../../core/models';
import { hoyISO, mensajeError } from '../../../core/util';
import { ModalComponent } from '../../../shared/modal.component';
import { MontoPipe } from '../../../shared/monto.pipe';

// Línea del carrito (se envía al backend como { idProducto, cantidadProducto })
interface LineaCompra {
  producto: Producto;
  cantidad: number;
}

/*
 Registro de compra a crédito con uno o varios productos.
 - Arriba: datos generales de la compra (cliente, tipo de pago, fecha, número de cuotas).
 - "Agregar producto" va llenando la tabla "Productos de la compra".
 - Cada cambio llama a POST /compras/simular para el Resumen; POST /compras registra.
 El backend genera UNA obligación y UN cronograma por el total de la compra.
 */
@Component({
  selector: 'app-compra-registro',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, ModalComponent, MontoPipe],
  templateUrl: './compra-registro.component.html'
})
export class CompraRegistroComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private compraService = inject(CompraService);
  private suscripciones: Subscription[] = [];
  private cambioCarrito$ = new Subject<void>();

  // Datos generales de la compra
  form = this.fb.nonNullable.group({
    idCliente: ['', Validators.required],
    tipoPago: ['Un solo pago' as TipoPago, Validators.required],
    fechaCompra: [hoyISO(), Validators.required],
    numeroCuotas: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]]
  });

  // Bloque "Agregar producto"
  formProducto = this.fb.nonNullable.group({
    idProducto: [''],
    cantidad: [1, [Validators.required, Validators.min(1)]]
  });

  clientes: Cliente[] = [];
  productos: Producto[] = [];
  lineas: LineaCompra[] = [];
  resumen: CompraResultado | null = null;
  avisoResumen = '';
  avisoProductos = '';
  simulando = false;
  guardando = false;
  error = '';
  registrada: CompraResultado | null = null;

  ngOnInit(): void {
    this.cargarClientes();
    this.productoService.listar().subscribe({
      next: (lista) => (this.productos = lista.filter((p) => p.estadoProducto === 'Activo')),
      error: (err) => (this.error = mensajeError(err))
    });

    // Cambio de tipo de pago: habilita las cuotas y quita los productos que no lo admiten
    this.suscripciones.push(
      this.form.controls.tipoPago.valueChanges.subscribe((tipo) => this.alCambiarTipoPago(tipo))
    );

    // Resumen en vivo: se recalcula al cambiar los datos generales o el carrito
    this.suscripciones.push(
      merge(this.form.valueChanges, this.cambioCarrito$).pipe(
        debounceTime(350),
        switchMap(() => {
          this.avisoResumen = '';
          const req = this.armarRequest();
          if (!req) {
            this.simulando = false;
            return of(null);
          }
          this.simulando = true;
          return this.compraService.simular(req).pipe(
            catchError((err) => {
              this.avisoResumen = mensajeError(err);
              return of(null);
            })
          );
        })
      ).subscribe((r) => {
        this.simulando = false;
        this.resumen = r;
      })
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (lista) => (this.clientes = lista.filter((c) => c.estadoCliente === 'Activo')),
      error: (err) => (this.error = mensajeError(err))
    });
  }

  // ---------- Datos calculados ----------
  get esCuotas(): boolean {
    return this.form.controls.tipoPago.value === 'Cuotas';
  }

  get clienteSeleccionado(): Cliente | undefined {
    return this.clientes.find((c) => c.idCliente === this.form.controls.idCliente.value);
  }

  get moneda(): string {
    return this.resumen?.moneda ?? this.clienteSeleccionado?.moneda ?? 'PEN';
  }

  // Contado = solo un pago; Crédito = solo cuotas; Ambas = cualquiera
  admiteTipoPago(p: Producto, tipo: TipoPago = this.form.controls.tipoPago.value): boolean {
    return p.modalidadVentaProducto === 'Ambas'
      || (tipo === 'Un solo pago' && p.modalidadVentaProducto === 'Contado')
      || (tipo === 'Cuotas' && p.modalidadVentaProducto === 'Crédito');
  }

  get productosDisponibles(): Producto[] {
    return this.productos.filter((p) => this.admiteTipoPago(p));
  }

  get productoSeleccionado(): Producto | undefined {
    return this.productos.find((p) => p.idProducto === this.formProducto.controls.idProducto.value);
  }

  get subtotalProducto(): number | null {
    const p = this.productoSeleccionado;
    const cantidad = Number(this.formProducto.controls.cantidad.value);
    return p && cantidad > 0 ? p.precioCredito * cantidad : null;
  }

  get totalUnidades(): number {
    return this.lineas.reduce((suma, l) => suma + l.cantidad, 0);
  }

  get totalCarrito(): number {
    return this.lineas.reduce((suma, l) => suma + l.producto.precioCredito * l.cantidad, 0);
  }

  get cuotaEstimada(): number | null {
    if (!this.resumen) {
      return null;
    }
    return this.esCuotas ? this.resumen.montoCuota : this.resumen.montoTotalPagar;
  }

  etiquetaModalidad(m: string): string {
    return m === 'Contado' ? 'Solo un pago' : m === 'Crédito' ? 'Solo cuotas' : m;
  }

  // ---------- Carrito ----------
  agregarProducto(): void {
    this.avisoProductos = '';
    const producto = this.productoSeleccionado;
    const cantidad = Number(this.formProducto.controls.cantidad.value);
    if (!producto) {
      this.avisoProductos = 'Seleccione un producto.';
      return;
    }
    if (!cantidad || cantidad < 1 || !Number.isInteger(cantidad)) {
      this.avisoProductos = 'La cantidad debe ser un número entero mayor a 0.';
      return;
    }
    // El backend no acepta un producto repetido: se suma a la línea existente
    const existente = this.lineas.find((l) => l.producto.idProducto === producto.idProducto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.lineas.push({ producto, cantidad });
    }
    this.formProducto.reset({ idProducto: '', cantidad: 1 });
    this.cambioCarrito$.next();
  }

  quitarLinea(indice: number): void {
    this.lineas.splice(indice, 1);
    this.avisoProductos = '';
    this.cambioCarrito$.next();
  }

  private alCambiarTipoPago(tipo: TipoPago): void {
    const cuotas = this.form.controls.numeroCuotas;
    if (tipo === 'Cuotas') {
      cuotas.enable({ emitEvent: false });
      if (cuotas.value < 2) {
        cuotas.setValue(Math.min(2, this.clienteSeleccionado?.maximoMesesCredito ?? 2), { emitEvent: false });
      }
    } else {
      cuotas.setValue(1, { emitEvent: false });
      cuotas.disable({ emitEvent: false });
    }

    const quitados = this.lineas.filter((l) => !this.admiteTipoPago(l.producto, tipo));
    if (quitados.length) {
      this.lineas = this.lineas.filter((l) => this.admiteTipoPago(l.producto, tipo));
      this.avisoProductos = `Se quitaron de la compra (no admiten "${tipo}"): `
        + quitados.map((l) => l.producto.descripcionProducto).join(', ') + '.';
      this.cambioCarrito$.next();
    }
    if (this.productoSeleccionado && !this.admiteTipoPago(this.productoSeleccionado, tipo)) {
      this.formProducto.controls.idProducto.setValue('');
    }
  }

  // ---------- Envío ----------
  private armarRequest(): CompraRequest | null {
    const v = this.form.getRawValue();
    if (!v.idCliente || !v.fechaCompra || !this.lineas.length) {
      return null;
    }
    return {
      idCliente: v.idCliente,
      tipoPago: v.tipoPago,
      numeroCuotas: v.tipoPago === 'Cuotas' ? Number(v.numeroCuotas) : 1,
      fechaCompra: v.fechaCompra,
      detalles: this.lineas.map((l) => ({ idProducto: l.producto.idProducto, cantidadProducto: l.cantidad }))
    };
  }

  registrar(): void {
    this.error = '';
    const req = this.armarRequest();
    if (this.form.invalid || !req) {
      this.form.markAllAsTouched();
      this.error = !this.lineas.length ? 'Agregue al menos un producto a la compra.' : 'Complete los datos de la compra.';
      return;
    }
    this.guardando = true;
    this.compraService.registrar(req).subscribe({
      next: (r) => {
        this.guardando = false;
        this.registrada = r;
      },
      error: (err) => {
        this.guardando = false;
        this.error = mensajeError(err);
      }
    });
  }

  nuevaCompra(): void {
    this.registrada = null;
    this.resumen = null;
    this.lineas = [];
    this.avisoProductos = '';
    this.formProducto.reset({ idProducto: '', cantidad: 1 });
    this.form.reset({ idCliente: '', tipoPago: 'Un solo pago', fechaCompra: hoyISO(), numeroCuotas: 1 });
    this.cargarClientes(); // el crédito disponible cambió
  }

  verCronograma(): void {
    const idCliente = this.registrada?.idCliente;
    this.registrada = null;
    this.router.navigate(['/negocio/cronograma'], { queryParams: idCliente ? { cliente: idCliente } : {} });
  }
}
