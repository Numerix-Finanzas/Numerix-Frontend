import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProductoService } from '../../../core/api.services';
import { ModalidadVenta, Producto } from '../../../core/models';
import { erroresCampo, mensajeError } from '../../../core/util';
import { ModalComponent } from '../../../shared/modal.component';
import { MontoPipe } from '../../../shared/monto.pipe';

@Component({
  selector: 'app-producto-registro',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, MontoPipe],
  templateUrl: './producto-registro.component.html'
})
export class ProductoRegistroComponent {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private router = inject(Router);

  // En el mockup: "Solo un pago" = Contado, "Solo cuotas" = Crédito (valores de modalidadVentaProducto)
  readonly modalidades: { valor: ModalidadVenta; etiqueta: string }[] = [
    { valor: 'Contado', etiqueta: 'Solo un pago' },
    { valor: 'Crédito', etiqueta: 'Solo cuotas' },
    { valor: 'Ambas', etiqueta: 'Ambas' }
  ];
  readonly unidades = ['Unidad', 'Saco', 'Bolsa', 'Botella', 'Lata', 'Paquete', 'Caja', 'Kilogramo', 'Litro'];

  form = this.fb.nonNullable.group({
    descripcionProducto: ['', [Validators.required, Validators.maxLength(150)]],
    marcaProducto: ['', Validators.maxLength(50)],
    proveedorProducto: ['', Validators.maxLength(100)],
    unidadMedida: ['Unidad', [Validators.required, Validators.maxLength(20)]],
    precioContado: [null as number | null, [Validators.required, Validators.min(0.01)]],
    precioCredito: [null as number | null, [Validators.required, Validators.min(0.01)]],
    modalidadVentaProducto: ['' as ModalidadVenta | '', Validators.required],
    estadoProducto: ['Activo' as 'Activo' | 'Inactivo']
  });

  imagenProducto: string | null = null;
  vistaPrevia: string | null = null;
  subiendo = false;
  guardando = false;
  error = '';
  errores: Record<string, string> = {};
  registrado: Producto | null = null;

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  seleccionarImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) {
      return;
    }
    if (!/\.(jpe?g|png)$/i.test(archivo.name)) {
      this.error = 'Formato de imagen no válido. Use .jpg o .png';
      return;
    }
    if (archivo.size > 2 * 1024 * 1024) {
      this.error = 'La imagen no debe superar los 2 MB.';
      return;
    }
    this.error = '';
    this.subiendo = true;
    this.productoService.subirImagen(archivo).subscribe({
      next: (r) => {
        this.subiendo = false;
        this.imagenProducto = r.imagenProducto;
        this.vistaPrevia = environment.serverUrl + r.imagenProducto;
      },
      error: (err) => {
        this.subiendo = false;
        this.error = mensajeError(err);
      }
    });
  }

  quitarImagen(): void {
    this.imagenProducto = null;
    this.vistaPrevia = null;
  }

  registrar(): void {
    this.error = '';
    this.errores = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Complete los campos obligatorios.';
      return;
    }
    const v = this.form.getRawValue();
    this.guardando = true;
    this.productoService.registrar({
      descripcionProducto: v.descripcionProducto.trim(),
      marcaProducto: v.marcaProducto.trim() || null,
      proveedorProducto: v.proveedorProducto.trim() || null,
      unidadMedida: v.unidadMedida,
      imagenProducto: this.imagenProducto,
      precioContado: Number(v.precioContado),
      precioCredito: Number(v.precioCredito),
      modalidadVentaProducto: v.modalidadVentaProducto as ModalidadVenta,
      estadoProducto: v.estadoProducto
    }).subscribe({
      next: (p) => {
        this.guardando = false;
        this.registrado = p;
      },
      error: (err) => {
        this.guardando = false;
        this.error = mensajeError(err);
        this.errores = erroresCampo(err);
      }
    });
  }

  etiquetaModalidad(valor: string | undefined): string {
    return this.modalidades.find((m) => m.valor === valor)?.etiqueta ?? valor ?? '';
  }

  nuevo(): void {
    this.registrado = null;
    this.quitarImagen();
    this.form.reset();
  }

  irAlListado(): void {
    this.router.navigate(['/negocio/productos']);
  }
}
