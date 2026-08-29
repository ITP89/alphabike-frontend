# AlphaBike Frontend

Frontend de AlphaBike construido con React, Vite, JavaScript, Tailwind CSS, Axios y React Router. El proyecto queda preparado para migracion progresiva a TypeScript.

## Variables requeridas

Crea `.env` tomando como base `.env.example`:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

## Instalar y ejecutar

```bash
npm install
npm run dev
```

La app local queda normalmente en `http://localhost:5173`.

## Build, tests y TypeScript

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm audit --audit-level=high
```

## Cumplimiento Avance 1 - Semana 8

- Configuracion del entorno: Vite + React, npm, scripts de desarrollo/build/lint/test/typecheck y variable `VITE_API_URL`.
- Estructura modular: `components`, `components/ui`, `context`, `hooks`, `pages`, `api`, `utils` y `types`.
- Navegacion: rutas publicas, rutas de cliente, rutas de encargado, rutas de administrador y pagina 404.
- Gestion de estado: `AuthContext` para sesion y `CarritoContext` para carrito reactivo persistido en `localStorage`.
- UI y estilos: Tailwind CSS, diseno responsive, navbar mobile, formularios con validaciones y componentes reutilizables.
- Consumo API REST: GET en tienda, servicios, galeria, pedidos y citas; POST en registro, login, citas, pedidos y formularios administrativos.
- Estados de interfaz: carga, error, vacio y exito con componentes compartidos.
- Control de versiones/documentacion: README, `.gitignore`, `.env.example`, Dockerfile y configuracion de tests.

## Flujo Git recomendado

Para evidenciar control de versiones en la presentacion:

```bash
git checkout -b develop
git checkout -b feature/frontend-avance-1
git add .
git commit -m "feat(frontend): mejorar avance 1 con api y ux responsive"
```

Usar commits semanticos como:

- `feat(frontend): conectar servicios con api`
- `fix(frontend): validar formulario de checkout`
- `docs(frontend): documentar ejecucion del proyecto`

## Funcionalidad conectada a API

- Home consume `/productos` y `/trabajos/destacados`.
- Servicios consume `/servicios`.
- Galeria consume `/trabajos`.
- Tienda consume `/productos` y `/categorias`, con busqueda, categoria y ordenamiento.
- Checkout crea pedidos en `/pedidos`; el pago queda pendiente para confirmacion por encargado/admin.

## Docker

El Dockerfile sirve la build con Nginx. Desde el directorio padre que contiene ambos repositorios:

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Rutas por rol

- `CLIENTE`: carrito, checkout, pedidos, citas y perfil.
- `ENCARGADO`: dashboard, citas, productos, venta presencial, entregas, pagos y galeria interna.
- `ADMIN`: dashboard, usuarios, citas, productos, pedidos, pagos, categorias, servicios y reportes.
