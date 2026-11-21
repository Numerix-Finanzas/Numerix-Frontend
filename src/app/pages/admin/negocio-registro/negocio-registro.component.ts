import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NegocioService } from '../../../core/api.services';
import { Negocio } from '../../../core/models';
import { erroresCampo, mensajeError } from '../../../core/util';
import { ModalComponent } from '../../../shared/modal.component';

@Component({
  selector: 'app-negocio-registro',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './negocio-registro.component.html'
})
export class NegocioRegistroComponent {
  private fb = inject(FormBuilder);
  private negocioService = inject(NegocioService);
  private router = inject(Router);

  // Mismas validaciones que NegocioRequestDTO
  form = this.fb.nonNullable.group({
    nombreNegocio: ['', [Validators.required, Validators.maxLength(100)]],
    rucNegocio: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    tipoNegocio: ['', [Validators.required, Validators.maxLength(60)]],
    nombreAdministradorNegocio: ['', [Validators.required, Validators.maxLength(100)]],
    correoElectronico: ['', [Validators.required, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)]],
    usuario: ['', [Validators.required, Validators.maxLength(20)]],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]]
  });

  tiposNegocio = ['Bodega', 'Bazar', 'Minimarket', 'Ferretería', 'Farmacia', 'Librería', 'Restaurante', 'Otro'];
  verContrasena = false;
  guardando = false;
  error = '';
  errores: Record<string, string> = {};
  registrado: Negocio | null = null;

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  registrar(): void {
    this.error = '';
    this.errores = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revise los campos marcados.';
      return;
    }
    this.guardando = true;
    const datos = this.form.getRawValue();
    this.negocioService.registrar({ ...datos, usuario: datos.usuario.trim() }).subscribe({
      next: (n) => {
        this.guardando = false;
        this.registrado = n;
      },
      error: (err) => {
        this.guardando = false;
        this.error = mensajeError(err);
        this.errores = erroresCampo(err);
      }
    });
  }

  nuevo(): void {
    this.registrado = null;
    this.form.reset();
  }

  irAlListado(): void {
    this.router.navigate(['/admin/negocios']);
  }
}
