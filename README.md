# Trabajo práctico 06

**Refactorización modular de un sistema de reservas de salas de estudio**

**Autora:** Jennifer Denis Chaves

**Curso:** Desarrollo Back-end con Node.js

## Proyecto de partida y cambios

Este proyecto parte del Trabajo Práctico 05, donde se desarrolló una aplicación web para gestionar reservas de salas de estudio utilizando Node.js, Express y EJS.

En el TP05, las rutas, los datos, los middleware y las funciones principales estaban definidos en un mismo archivo `src/index.js`.

En el TP06 se reorganizó la aplicación en módulos separados, manteniendo el mismo diseño, las vistas, las validaciones y el comportamiento de las rutas.

El objetivo de la refactorización es mejorar la organización, facilitar el mantenimiento y separar las responsabilidades del código.

**Cambios realizados:**

- Separación del arranque del servidor y la configuración de Express.
- Creación de un módulo de configuración para las variables de entorno.
- Separación de rutas, controladores y servicio de reservas.
- Organización de los middleware personalizados.
- Incorporación de Prettier y ESLint.
- Conservación de las reservas en memoria, sin base de datos.

El repositorio original del TP05 se conserva de manera independiente.

## Instalación y ejecución

Para instalar las dependencias:


npm install


Para iniciar el servidor:


npm start


La aplicación estará disponible en:


http://localhost:3000


Para comprobar el formato y analizar el código:


npm run check


## Configuración del entorno

La aplicación utiliza las variables `PORT` y `NODE_ENV`.

El archivo `.env.example` contiene:


PORT=3000
NODE_ENV=development


**PORT:** indica el puerto donde se ejecutará el servidor. Si no está definido, se utiliza el puerto 3000.

**NODE_ENV:** permite diferenciar el entorno de ejecución.

En desarrollo, Morgan utiliza el formato `dev`. Cuando `NODE_ENV=production`, utiliza `combined`.

Este cambio solamente modifica el formato del registro de solicitudes.

El archivo `.env` está excluido de Git mediante `.gitignore`.

### Pruebas de configuración

Se realizaron las siguientes pruebas en PowerShell:

| Configuración | Resultado observado |
|---|---|
| Sin PORT | Servidor iniciado en puerto 3000 |
| PORT=4000 | Servidor iniciado en puerto 4000 |
| PORT=70000 | Error de configuración; el servidor no inicia |

El mensaje observado para el puerto inválido fue:


Error de configuración: PORT debe ser un número entero entre 1 y 65535.


## Mapa de módulos y dependencias

La aplicación está organizada de la siguiente manera:


tp-06-salas-modular/
├── public/
│   └── css/
│       └── estilos.css
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── reservas/
│   │   ├── lista.ejs
│   │   ├── detalle.ejs
│   │   └── nueva.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
├── src/
│   ├── index.js
│   ├── app.js
│   ├── configuracion.js
│   ├── rutas/
│   │   └── reservas.js
│   ├── controladores/
│   │   └── reservas.js
│   ├── servicios/
│   │   └── reservas.js
│   └── middleware/
│       ├── solicitudes.js
│       └── reservas.js
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md


### Responsabilidad de cada módulo

| Módulo | Responsabilidad |
|---|---|
| `index.js` | Crea el servicio y el controlador, configura e inicia el servidor |
| `configuracion.js` | Lee y valida las variables de entorno |
| `app.js` | Configura Express, middleware, vistas y rutas |
| `rutas/reservas.js` | Relaciona las rutas con los controladores |
| `controladores/reservas.js` | Atiende solicitudes y genera respuestas HTTP |
| `servicios/reservas.js` | Administra las reservas en memoria |
| `middleware/solicitudes.js` | Identifica solicitudes y mide su duración |
| `middleware/reservas.js` | Define la sección y valida las reservas |

### Separación de responsabilidades

El servicio de reservas no utiliza `req` ni `res` porque su función es administrar datos, no responder solicitudes HTTP.

El controlador recibe las solicitudes, consulta el servicio y devuelve una respuesta mediante `render()`, `json()` o `redirect()`.

El router declara caminos relativos como `/`, `/nueva` y `/:id`, porque se monta desde `app.js` utilizando el prefijo `/reservas`.

El arreglo de reservas existe en una sola instancia del servicio, creada desde `index.js`.

Esto permite que el listado, el detalle, la creación y `/estado` consulten los mismos datos.

## Pipeline y contrato de rutas

Se conservó el orden de middleware del TP05:


Solicitud HTTP
      ↓
Morgan
      ↓
identificarSolicitud
      ↓
medirDuracion
      ↓
express-ejs-layouts
      ↓
express.static
      ↓
express.urlencoded
      ↓
express.json
      ↓
Rutas generales
      ↓
Router /reservas
      ↓
Middleware 404 final


Morgan registra las solicitudes HTTP, incluidos los recursos estáticos, porque se encuentra antes de `express.static`.

`identificarSolicitud` genera identificadores consecutivos como `BIB-0001`.

`medirDuracion` utiliza el evento `finish` para registrar el tiempo transcurrido al finalizar la respuesta.

### Rutas

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/` | 200 - Página principal |
| GET | `/estado` | 200 - Estado JSON |
| GET | `/reservas` | 200 - Listado |
| GET | `/reservas/nueva` | 200 - Formulario |
| GET | `/reservas/:id` | 200 o 404 - Detalle |
| POST | `/reservas` | 302 válido o 400 inválido |
| GET | `/css/estilos.css` | 200 - Archivo CSS |
| GET | Ruta inexistente | 404 - Página HTML |

La ruta `/nueva` se declara antes de `/:id`.

### Validación de reservas

El middleware `validarReserva` comprueba que:

- Los campos obligatorios no estén vacíos.
- El email contenga `@`.
- La sala pertenezca a las opciones permitidas.
- El turno sea válido.
- La cantidad de personas sea un entero entre 1 y 6.

Si los datos son inválidos, responde HTTP 400 y conserva los valores ingresados.

Si son válidos, prepara `req.reservaValidada` y ejecuta `next()` para continuar hacia el controlador.

El controlador registra la reserva mediante el servicio y redirige a `/reservas` con HTTP 302.

## Matriz antes/después

Se comprobó que el comportamiento de las rutas se conserva después de la refactorización.

| Prueba | TP05 | TP06 |
|---|---|---|
| Página de inicio | 200 | 200 |
| Estado JSON | 200 | 200 |
| Listado de reservas | 200 | 200 |
| Formulario | 200 | 200 |
| Detalle existente | 200 | 200 |
| Detalle inexistente | 404 | 404 |
| POST vacío | 400 | 400 |
| Sala no permitida | 400 | 400 |
| Email inválido | 400 | 400 |
| Personas fuera de rango | 400 | 400 |
| POST válido | 302 | 302 |
| CSS | 200 | 200 |
| URL inexistente | 404 | 404 |
| Reinicio del servidor | Datos iniciales | Datos iniciales |

### Evidencias de funcionamiento

La aplicación inicia correctamente y muestra las reservas originales.

El registro de Morgan y el middleware personalizado permiten comprobar el estado y la duración de las solicitudes.

Ejemplo observado durante las pruebas:


GET / 200
[BIB-0001] GET / 200 42.38 ms


Se comprobó también que el puerto 4000 responde correctamente y que el puerto 70000 es rechazado.

Al registrar una reserva válida, la cantidad de reservas aumenta. Al reiniciar el servidor, vuelve a los cuatro registros iniciales.

## Formato y análisis estático

Se incorporaron Prettier y ESLint como dependencias de desarrollo.

Comandos utilizados:


npm install --save-dev prettier eslint @eslint/js
npm run format
npm run check


`npm run format` aplica el formato de Prettier a los archivos de `src`.

`npm run check` ejecuta dos comprobaciones:


npm run format:check
npm run lint


El resultado final fue satisfactorio:


Checking formatting...
All matched files use Prettier code style!


ESLint terminó sin reportar errores.

Estas herramientas permiten mantener un estilo de código uniforme y detectar problemas de análisis estático.

## Persistencia temporal y límites

Las reservas se almacenan únicamente en memoria mediante el servicio `crearServicioReservas`.

Al iniciar la aplicación, se cargan cuatro reservas.

Cuando se crea una nueva reserva, se agrega al arreglo compartido por el servicio.

Al detener y reiniciar el servidor, los datos agregados desaparecen y se recuperan las cuatro reservas iniciales.

La aplicación no utiliza base de datos ni archivos para guardar las reservas de forma permanente.

Este trabajo se concentra en la organización modular de una aplicación existente, sin agregar funcionalidades fuera del alcance solicitado.