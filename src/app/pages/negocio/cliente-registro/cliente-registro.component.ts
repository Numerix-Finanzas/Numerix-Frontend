import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../../core/api.services';
import { ClienteRegistrado } from '../../../core/models';
import { erroresCampo, mensajeError } from '../../../core/util';
import { ModalComponent } from '../../../shared/modal.component';

// Formato del número de documento (igual que en ClienteServiceImpl)
const PATRON_DOCUMENTO: Record<string, RegExp> = {
  DNI: /^\d{8}$/,
  CE: /^[A-Z0-9]{9}$/,
  RUC: /^\d{11}$/
};
const AYUDA_DOCUMENTO: Record<string, string> = {
  DNI: 'El DNI debe tener 8 dígitos.',
  CE: 'El CE debe tener 9 caracteres (letras mayúsculas o números).',
  RUC: 'El RUC debe tener 11 dígitos.'
};

@Component({
  selector: 'app-cliente-registro',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './cliente-registro.component.html'
})
export class ClienteRegistroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  readonly periodos = ['Diario', 'Mensual', 'Trimestral', 'Semestral', 'Anual'];
  readonly ayudaDocumento = AYUDA_DOCUMENTO;

  // Valores por defecto de ClienteRequestDTO
  form = this.fb.nonNullable.group({
    nombreCliente: ['', [Validators.required, Validators.maxLength(100)]],
    tipoDocumentoCliente: ['DNI', Validators.required],
    numeroDocumentoCliente: ['', [Validators.required, Validators.pattern(PATRON_DOCUMENTO['DNI'])]],
    moneda: ['PEN', Validators.required],
    limiteCredito: [null as number | null, [Validators.required, Validators.min(0.01)]],
    tipoTasa: ['Efectiva', Validators.required],
    porcentajeTasa: [null as number | null, [Validators.required, Validators.min(0.0000001)]],
    tipoTasaMoratoria: ['Efectiva', Validators.required],
    porcentajeTasaMoratoria: [null as number | null, [Validators.required, Validators.min(0.0000001)]],
    periodoTasa: ['Mensual', Validators.required],
    periodoCapitalizacion: [30, [Validators.required, Validators.min(1)]],
    diaCorte: [25, [Validators.required, Validators.min(1), Validators.max(30)]],
    diaPagoPactado: [30, [Validators.required, Validators.min(1), Validators.max(30)]],
    maximoMesesCredito: [1, [Validators.required, Validators.min(1)]]
  });

  guardando = false;
  error = '';
  errores: Record<string, string> = {};
  registrado: ClienteRegistrado | null = null;

  ngOnInit(): void {
    // Al cambiar el tipo de documento cambia la validación del número
    this.form.controls.tipoDocumentoCliente.valueChanges.subscribe((tipo) => {
      const num = this.form.controls.numeroDocumentoCliente;
      num.setValidators([Validators.required, Validators.pattern(PATRON_DOCUMENTO[tipo] ?? /.*/)]);
      num.updateValueAndValidity();
    });
  }

  // El periodo de capitalización solo se usa si alguna de las tasas es nominal
  get usaCapitalizacion(): boolean {
    const v = this.form.getRawValue();
    return v.tipoTasa === 'Nominal' || v.tipoTasaMoratoria === 'Nominal';
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  registrar(): void {
    this.error = '';
    this.errores = {};
    const num = this.form.controls.numeroDocumentoCliente;
    num.setValue(num.value.trim().toUpperCase());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Revise los campos marcados.';
      return;
    }
    const v = this.form.getRawValue();
    this.guardando = true;
    this.clienteService.registrar({
      ...v,
      nombreCliente: v.nombreCliente.trim(),
      limiteCredito: Number(v.limiteCredito),
      porcentajeTasa: Number(v.porcentajeTasa),
      porcentajeTasaMoratoria: Number(v.porcentajeTasaMoratoria),
      periodoCapitalizacion: Number(v.periodoCapitalizacion),
      diaCorte: Number(v.diaCorte),
      diaPagoPactado: Number(v.diaPagoPactado),
      maximoMesesCredito: Number(v.maximoMesesCredito)
    }).subscribe({
      next: (r) => {
        this.guardando = false;
        this.registrado = r;
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
    this.router.navigate(['/negocio/clientes']);
  }
}
