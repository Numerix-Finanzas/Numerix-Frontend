import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
    recordarContrasena: [false]
  });

  verContrasena = false;
  cargando = false;
  error = '';
  aviso = '';

  ngOnInit(): void {
    const recordado = this.auth.usuarioRecordado();
    if (recordado) {
      this.form.patchValue({ usuario: recordado, recordarContrasena: true });
    }
    if (this.route.snapshot.queryParamMap.get('expirada')) {
      this.aviso = 'Su sesión expiró. Vuelva a iniciar sesión.';
    }
  }

  ingresar(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Ingrese su usuario y contraseña.';
      return;
    }
    this.cargando = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigateByUrl(this.auth.rutaInicio());
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeError(err);
      }
    });
  }

  olvideContrasena(evento: Event): void {
    evento.preventDefault();
    this.aviso = 'Para restablecer su contraseña comuníquese con el administrador de su negocio.';
  }
}
