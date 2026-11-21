import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="fondo-circulos" aria-hidden="true">
      <span class="c1"></span><span class="c2"></span><span class="c3"></span><span class="c4"></span>
    </div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
