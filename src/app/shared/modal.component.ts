import { Component, EventEmitter, Input, Output } from '@angular/core';

// Ventana emergente (confirmaciones "¡Cliente registrado correctamente!", "¡Compra registrada!", etc.)
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (abierto) {
      <div class="modal-fondo" (click)="cerrar.emit()">
        <div class="modal-caja" (click)="$event.stopPropagation()">
          @if (titulo) {
            <h3 class="modal-titulo">{{ titulo }}</h3>
          }
          <ng-content></ng-content>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() abierto = false;
  @Input() titulo = '';
  @Output() cerrar = new EventEmitter<void>();
}
