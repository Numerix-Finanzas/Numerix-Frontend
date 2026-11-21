import { Pipe, PipeTransform } from '@angular/core';

// Formatea un importe con el símbolo de la moneda: 1234.5 | monto:'PEN'  ->  S/ 1,234.50
@Pipe({ name: 'monto', standalone: true })
export class MontoPipe implements PipeTransform {
  transform(valor: number | null | undefined, moneda: string | null | undefined = 'PEN'): string {
    if (valor === null || valor === undefined || isNaN(Number(valor))) {
      return '—';
    }
    const simbolo = moneda === 'USD' ? 'US$' : 'S/';
    const numero = Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${simbolo} ${numero}`;
  }
}
