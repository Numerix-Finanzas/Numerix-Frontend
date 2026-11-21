import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProductoService } from '../../../core/api.services';
import { Estado, Producto } from '../../../core/models';
import { mensajeError } from '../../../core/util';
import { EstadoComponent } from '../../../shared/estado.component';
import { MontoPipe } from '../../../shared/monto.pipe';

@Component({
  selector: 'app-producto-listado',
  standalone: true,
  imports: [RouterLink, EstadoComponent, MontoPipe],
  template: `
    <h1 class="titulo">Listado de productos</h1>
    @if (error) { <p class="alerta alerta-error centrado">{{ error }}</p> }
    <div class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>Código</th><th>Descripción</th><th>Marca</th><th>Proveedor</th><th>Unidad de medida</th>
            <th>Imagen</th><th>Precio contado</th><th>Precio crédito</th><th>Modalidad</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (p of productos; track p.idProducto) {
            <tr>
              <td class="codigo">{{ p.idProducto }}</td>
              <td>{{ p.descripcionProducto }}</td>
              <td>{{ p.marcaProducto }}</td>
              <td>{{ p.proveedorProducto }}</td>
              <td>{{ p.unidadMedida }}</td>
              <td>
                @if (p.imagenProducto) {
                  <img class="miniatura" [src]="servidor + p.imagenProducto" [alt]="p.descripcionProducto">
                } @else {
                  <span class="miniatura-vacia"></span>
                }
              </td>
              <td>{{ p.precioContado | monto }}</td>
              <td>{{ p.precioCredito | monto }}</td>
              <td>{{ etiquetaModalidad(p.modalidadVentaProducto) }}</td>
              <td>
                <app-estado [estado]="p.estadoProducto" [editable]="true" [ocupado]="ocupado === p.idProducto"
                            (cambiar)="cambiarEstado(p, $event)"></app-estado>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="10" class="vacio">{{ cargando ? 'Cargando...' : 'No hay productos registrados.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
    <div class="acciones-centro">
      <a class="btn btn-grande" routerLink="/negocio/productos/registro">Registrar un producto</a>
    </div>
  `
})
export class ProductoListadoComponent implements OnInit {
  private productoService = inject(ProductoService);
  readonly servidor = environment.serverUrl;
  productos: Producto[] = [];
  cargando = true;
  ocupado: string | null = null;
  error = '';

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: (lista) => {
        this.productos = lista;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeError(err);
      }
    });
  }

  etiquetaModalidad(m: string): string {
    return m === 'Contado' ? 'Solo un pago' : m === 'Crédito' ? 'Solo cuotas' : m;
  }

  cambiarEstado(producto: Producto, estado: Estado): void {
    this.error = '';
    this.ocupado = producto.idProducto;
    this.productoService.cambiarEstado(producto.idProducto, estado).subscribe({
      next: (p) => {
        Object.assign(producto, p);
        this.ocupado = null;
      },
      error: (err) => {
        this.ocupado = null;
        this.error = mensajeError(err);
      }
    });
  }
}
