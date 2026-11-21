# Numerix – Frontend (Angular 19)

Frontend de Numerix hecho a partir de los mockups (`Group 101_merged.pdf`), conectado al backend
`numerix-backend` (Spring Boot + JWT). Se abre y ejecuta en **WebStorm**; el backend sigue en **IntelliJ**.

## Requisitos

- Node.js 18.19+, 20 o 22 (LTS). Comprobar con `node -v`.
- Angular CLI (opcional, global): `npm install -g @angular/cli@19`
- El backend en ejecución en `http://localhost:8080` (PostgreSQL con la base `db_numerix`).

## Abrir y ejecutar en WebStorm

1. **File → Open…** y elegir la carpeta `numerix-frontend` (la que tiene `package.json`).
2. WebStorm muestra el aviso *"Run 'npm install'"*: pulsar **Run**. También se puede ejecutar en la
   terminal de WebStorm (Alt+F12): `npm install`
3. Ejecutar la aplicación de cualquiera de estas formas:
   - Abrir `package.json` y pulsar el triángulo verde ▶ junto al script **start**, o
   - En la terminal: `npm start` (equivale a `ng serve --open`).
4. Se abre `http://localhost:4200`. **Debe ser el puerto 4200**: es el que el backend permite en CORS
   (`ip.frontend=http://localhost:4200` en `application.properties`).

Orden recomendado: primero iniciar el backend en IntelliJ (`NumerixApplication`), luego `npm start` en WebStorm.

Si el backend usa otro puerto, cambiarlo en `src/environments/environment.ts`.

## Usuarios de prueba (cargados por `import.sql` del backend)

| Rol | Usuario | Contraseña | Pantallas |
|---|---|---|---|
| Administrador del sistema | `admin` | `Numerix2026` | Inicio (dashboard), Registro y Listado de negocios |
| Administrador de negocio | `donlucho` | `Bodega2026` | Productos, Clientes, Compras, Cronograma, Pagos, Consultas |
| Administrador de negocio | `laesquina` | `Bazar2026` | (mismo módulo, otro negocio) |
| Cliente | `45871236` | `NX45871236` | Su cronograma, movimientos y reporte de deuda |

Con `ddl-auto=create-drop`, los datos registrados se borran cada vez que se reinicia el backend.

## Estructura

```
src/
├── environments/environment.ts        URL del backend
├── styles.css                         estilos globales (colores, botones, tablas, modales de los mockups)
└── app/
    ├── app.routes.ts                  rutas por rol (admin / negocio / cliente)
    ├── app.config.ts                  HttpClient + interceptor JWT
    ├── core/
    │   ├── models.ts                  interfaces = DTOs del backend
    │   ├── api.services.ts            NegocioService, ProductoService, ClienteService, CompraService, PagoService
    │   ├── auth.service.ts            login, sesión (localStorage/sessionStorage), rol
    │   ├── auth.interceptor.ts        agrega "Authorization: Bearer <jwt>"; con 401 cierra sesión
    │   ├── auth.guard.ts              protege las rutas según el rol
    │   └── util.ts                    mensajes de error del backend, fecha de hoy
    ├── shared/                        modal, estado (Activo/Inactivo), pipe "monto" (S/ / US$)
    ├── layout/shell.component.ts      barra superior con el menú de cada rol
    └── pages/
        ├── login/
        ├── admin/        dashboard, negocio-registro, negocio-listado
        ├── negocio/      producto-registro, producto-listado, cliente-registro, cliente-listado,
        │                 compra-registro, pago-registro
        └── consultas/    cronograma, movimientos, reporte-deuda (los usa el admin del negocio y el cliente)
```

## Pantalla ↔ endpoint

| Mockup | Ruta del frontend | Endpoint(s) |
|---|---|---|
| Iniciar sesión | `/login` | `POST /api/authenticate` |
| Dashboard (Total / activos / inactivos) | `/admin/inicio` | `GET /api/admin/dashboard` |
| Registrar negocio | `/admin/negocios/registro` | `POST /api/negocios` |
| Listado de negocios | `/admin/negocios` | `GET /api/negocios`, `PUT /api/negocios/{id}/estado` |
| Registro de productos | `/negocio/productos/registro` | `POST /api/productos/imagen`, `POST /api/productos` |
| Listado de productos | `/negocio/productos` | `GET /api/productos`, `PUT /api/productos/{id}/estado` |
| Cliente + Condiciones de crédito | `/negocio/clientes/registro` | `POST /api/clientes` (muestra usuario y contraseña generados) |
| Listado de clientes | `/negocio/clientes` | `GET /api/clientes`, `PUT /api/clientes/{id}/estado` |
| Registro de compra a crédito | `/negocio/compras` | `POST /api/compras/simular` (Resumen en vivo), `POST /api/compras` |
| Registrar pago | `/negocio/pagos` | `GET /api/clientes/{id}/obligaciones-pendientes`, `GET /api/pagos/simular`, `POST /api/pagos` |
| Cronograma | `/negocio/cronograma` | `GET /api/clientes/{id}/cronograma` |
| Movimientos (Compras / Pagos) | `/negocio/consultas/movimientos` | `GET /api/clientes/{id}/compras`, `GET /api/clientes/{id}/pagos` |
| Reporte de deuda | `/negocio/consultas/reporte-deuda` | `GET /api/clientes/{id}/reporte-deuda?fecha=` |

## Decisiones tomadas para que coincida con el backend

- **Registrar negocio** tiene un campo extra, *Tipo de negocio*: el backend lo exige (`tipoNegocio` es `@NotBlank`)
  y no estaba en el mockup.
- **Modalidad de venta:** en pantalla se muestra "Solo un pago / Solo cuotas / Ambas", pero se envía
  `Contado / Crédito / Ambas`, que son los valores que acepta el backend.
- **Compra con varios productos:** arriba van los datos generales (cliente, tipo de pago, fecha y número de cuotas);
  con *Agregar producto* se arma la tabla *Productos de la compra*, que se envía como
  `detalles: [{ idProducto, cantidadProducto }]` a `/compras/simular` y `/compras`. Si se agrega un producto que ya está
  en la tabla, se suma la cantidad (el backend no acepta productos repetidos). El combo solo muestra productos activos
  cuya modalidad admite el tipo de pago; si se cambia el tipo de pago, se quitan de la tabla los que ya no lo admiten.
  El Resumen se recalcula con cada cambio y el backend genera una sola obligación y un solo cronograma por el total.
  Si el backend rechaza la compra (excede el crédito, más cuotas que el máximo, etc.), el motivo aparece en el Resumen.
- **Pago:** el backend no acepta pagos parciales, por eso se envía exactamente el *Total a pagar* calculado por
  `/pagos/simular` para la fecha real de pago elegida. *Días de mora* y *Fecha pactada* se llenan solos.
- **Imagen del producto:** al pulsar *Subir imagen* se sube en el momento (.jpg/.png, máx. 2 MB) y la ruta devuelta
  se guarda en `imagenProducto`.
- **Activar / inactivar:** en los listados, el círculo de la columna Estado funciona como interruptor.
- **Recordar contraseña:** guarda la sesión en `localStorage` (el backend da un token de 7 días); sin marcarlo se usa
  `sessionStorage`. Al vencer el token, el backend responde 401 y el frontend vuelve al login.
- **¿Olvidaste tu contraseña?** muestra un aviso: el backend no tiene un endpoint para recuperarla.
- **Rol Cliente:** no tiene mockups propios; usa las mismas pantallas de consulta, sin el combo de cliente.

## Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| "No se pudo conectar con el servidor" | El backend no está corriendo, o no está en el puerto 8080. |
| Error de CORS en la consola del navegador | El frontend no está en `http://localhost:4200` (no usar 127.0.0.1 ni otro puerto). |
| `ng` no se reconoce | Usar `npm start` en vez de `ng serve`, o instalar `npm i -g @angular/cli@19`. |
| Los datos registrados desaparecen | El backend usa `create-drop`; se reinicia la base en cada arranque. |
