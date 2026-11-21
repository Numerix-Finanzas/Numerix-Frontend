import { Component, EventEmitter, Input, Output } from '@angular/core';

/*
 Estado de la fila como en los mockups: círculo + etiqueta (Activo verde / Inactivo rojo).
 Si "editable" es true, el círculo funciona como interruptor para activar o inactivar.
 También se usa para los estados de deuda (Pendiente, Pagado, Vencido).
 */
@Component({
  selector: 'app-estado',
  standalone: true,
  template: `
    <span class="estado">
      @if (editable) {
        <button type="button" class="estado-circulo" [class.lleno]="estado === 'Activo'"
                [disabled]="ocupado"
                [title]="estado === 'Activo' ? 'Clic para inactivar' : 'Clic para activar'"
                (click)="cambiar.emit(estado === 'Activo' ? 'Inactivo' : 'Activo')"></button>
      }
      <span [class]="'badge badge-' + (estado || '').toLowerCase()">{{ estado }}</span>
    </span>
  `
})
export class EstadoComponent {
  @Input() estado: string | null | undefined = '';
  @Input() editable = false;
  @Input() ocupado = false;
  @Output() cambiar = new EventEmitter<'Activo' | 'Inactivo'>();
}
