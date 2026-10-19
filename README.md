# API de Sanidad Vegetal

API REST de sanidad vegetal para Breaze in the Moon


## 1. Descripción del proyecto

La API de Sanidad Vegetal es una API REST desarrollada con NestJS, TypeORM y MySQL para la compañía agrícola Breaze in the Moon. Centraliza la información que hoy está dispersa en cuadernos y hojas de cálculo: plantas, patógenos, enfermedades, susceptibilidades, tratamientos, cultivos y brotes reportados en campo. Además ofrece consultas compuestas, verificación de mutaciones genéticas y estadísticas de brotes.

Decisiones principales del proyecto:

- Un módulo por recurso, cada uno con su controlador, servicio y DTOs (y su entidad cuando usa TypeORM).
- Validaciones manuales en los servicios, sin `ValidationPipe`. Cada validación que falla responde con el código HTTP adecuado y un mensaje claro en español (400, 404, 409).
- Relaciones solo por ID: no se usan decoradores de relaciones de TypeORM (`@ManyToOne`, `@OneToMany`, etc.), ni la opción `relations`, ni `join...AndSelect`. Las relaciones se guardan como columnas con el ID y se resuelven manualmente en los servicios.
- Documentación con Swagger de todos los endpoints, parámetros, cuerpos y respuestas.
- Nombres de atributos, columnas, rutas y mensajes en español; solo se conservan en inglés las palabras propias del framework (Service, Controller, Module, Entity, Dto).


## 2. Integrantes

| Integrante | Responsabilidades |
|---|---|
| Juan Pablo | Arquitectura del proyecto, plantas y cultivos; colección de Bruno; integración de ramas en Gitflow. |
| Alejandra | Susceptibilidades, brotes y estadísticas. |
| Tomás (Thomas) | Patógenos, enfermedades y tratamientos; consultas compuestas; traducción al español, DTOs y Swagger; README. |


## 3. Tecnologías

- Node.js y TypeScript
- NestJS 12
- TypeORM
- MySQL
- Swagger (`@nestjs/swagger`)
- Bruno (colección de peticiones)
- Git y GitHub (Gitflow)


### Estructura del proyecto

```
src/
  main.ts                 arranque de la aplicación y configuración de Swagger
  app.module.ts           módulo raíz (conexión a MySQL y módulos de cada recurso)
  comun/                  validaciones, constantes y utilidades compartidas
  plantas/ patogenos/ enfermedades/ tratamientos/
  susceptibilidades/ cultivos/ brotes/ estadisticas/
                          cada carpeta: módulo, controlador, servicio, DTOs y, si aplica, entidad
database/                 proyecto_back.sql (esquema) y datos_ejemplo.sql (datos de ejemplo)
entrega/entrega/bruno/    colección de Bruno
```


## 4. Requisitos previos

- Node.js y npm
- MySQL Server 8 o superior
- Git
- Bruno (para ejecutar la colección de peticiones)


## 5. Instalación y configuración


### 5.1. Clonar el repositorio

```bash
git clone https://github.com/Juan2005855/salud_de_plantas
cd salud_de_plantas
git checkout develop
```


### 5.2. Instalar dependencias

```bash
npm install
```


### 5.3. Configurar las variables de entorno

Copia el archivo de ejemplo y completa tus credenciales de MySQL:

```bash
cp .env.example .env
```

Contenido de `.env.example`:

```
PORT=3000
ZONA_HORARIA=America/Bogota

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=proyecto_back
DB_SYNCHRONIZE=false
```

El archivo `.env` está en el `.gitignore` y no debe subirse al repositorio. `ZONA_HORARIA` se usa para decidir qué fecha es «hoy» al rechazar fechas futuras.


### 5.4. Crear la base de datos y cargar los datos de ejemplo

La carpeta `database/` tiene dos scripts que se ejecutan en este orden:

1. `database/proyecto_back.sql`: crea la base de datos `proyecto_back` y todas las tablas.
2. `database/datos_ejemplo.sql`: vacía las tablas y carga los datos de ejemplo para la sustentación.

```bash
mysql -u TU_USUARIO -p --default-character-set=utf8mb4 < database/proyecto_back.sql
mysql -u TU_USUARIO -p --default-character-set=utf8mb4 < database/datos_ejemplo.sql
```

Con la opción `--default-character-set=utf8mb4` se evita que las tildes y la «ñ» (por ejemplo `todo_el_año`) se carguen mal. El segundo script puede ejecutarse varias veces: vuelve a dejar los datos de ejemplo en su estado inicial. Para empezar de cero, elimina la base de datos (`DROP DATABASE proyecto_back;`) y ejecuta ambos scripts otra vez.


## 6. Ejecución

```bash
# Desarrollo (con recarga automática)
npm run start:dev

# Normal
npm run start

# Compilar
npm run build
```

La API queda disponible en `http://localhost:3000` (o en el puerto definido en `PORT`).


## 7. Documentación de la API (Swagger)

Con la aplicación en ejecución, abre en el navegador:

```
http://localhost:3000/api/documentacion
```


## 8. Endpoints

### Recursos (CRUD)

Cada recurso ofrece `POST /recurso`, `GET /recurso`, `GET /recurso/:id`, `DELETE /recurso/:id` y la actualización por `PATCH /recurso/:id` (en plantas la actualización es `PUT /plantas/:id`).

| Recurso | Ruta base | Filtros del GET (query params) |
|---|---|---|
| Plantas | `/plantas` | `nombre`, `familiaBotanica`, `tipoCultivo` |
| Patógenos | `/patogenos` | — |
| Enfermedades | `/enfermedades` | — |
| Susceptibilidades | `/susceptibilidades` | — |
| Tratamientos | `/tratamientos` | — |
| Cultivos | `/cultivos` | `plantaId`, `region`, `fechaDesde`, `fechaHasta` |
| Brotes | `/brotes` | `plantaId`, `enfermedadId`, `region`, `fechaDesde`, `fechaHasta` |

### Campos de cada recurso

Todos los recursos tienen además un `id` numérico autoincremental que genera la base de datos.

| Recurso | Campos del cuerpo (POST) | Reglas |
|---|---|---|
| Plantas | `nombreComun`, `nombreCientifico`, `familiaBotanica`, `tipoCultivo`, `secuenciaGenetica` | `nombreCientifico` único; secuencia solo con A, C, G, T en mayúscula. |
| Patógenos | `nombre`, `nombreCientifico`, `tipo`, `transmision`, `secuenciaGenetica` | `nombreCientifico` único; secuencia solo con A, C, G, T en mayúscula. |
| Enfermedades | `nombre`, `descripcionSintomas`, `epocaRiesgo`, `patogenoId` | El patógeno debe existir. |
| Tratamientos | `nombre`, `descripcionAplicacion`, `tipo`, `enfermedadId` | La enfermedad debe existir. |
| Susceptibilidades | `plantaId`, `enfermedadId`, `nivel` | Planta y enfermedad deben existir; no se repite el par planta-enfermedad. |
| Cultivos | `plantaId`, `lote`, `region`, `fechaSiembra`, `codigoGeneticoSemilla` | La planta debe existir; fecha `AAAA-MM-DD` que no sea futura; código solo con A, C, G, T en mayúscula. |
| Brotes | `plantaId`, `enfermedadId`, `fecha`, `region`, `hectareasAfectadas` | Planta y enfermedad deben existir; fecha no futura; hectáreas mayores que cero (máximo dos decimales). |

Ejemplo de cuerpo para `POST /brotes`:

```json
{
  "plantaId": 1,
  "enfermedadId": 1,
  "fecha": "2026-09-15",
  "region": "Caldas",
  "hectareasAfectadas": 12.5
}
```

Ejemplo de cuerpo para `POST /cultivos`:

```json
{
  "plantaId": 1,
  "lote": "Finca La Esperanza lote 4",
  "region": "Boyaca",
  "fechaSiembra": "2026-03-15",
  "codigoGeneticoSemilla": "AGACTTTCAAAGATATGCTGGGTAGAGGTCGAGGTT"
}
```

### Consultas compuestas y verificación de mutaciones

| Endpoint | Qué devuelve |
|---|---|
| `GET /plantas/:id/enfermedades` | Planta con las enfermedades a las que es susceptible y el nivel de susceptibilidad de cada una. |
| `GET /enfermedades/:id/detalle` | Enfermedad con su patógeno y sus tratamientos. |
| `GET /brotes/resumen` | Resumen de los brotes registrados. |
| `GET /cultivos/:id/verificacion-mutaciones` | Número y posiciones (desde 1) de las mutaciones de la semilla del cultivo frente a la secuencia de referencia de su planta. Si las longitudes no coinciden responde 400 con un mensaje claro. |

### Estadísticas

| Endpoint | Qué devuelve |
|---|---|
| `GET /estadisticas/brotes/por-enfermedad` | Brotes y hectáreas afectadas por enfermedad. |
| `GET /estadisticas/brotes/por-region` | Brotes y hectáreas afectadas por región. |
| `GET /estadisticas/brotes/por-periodo` | Brotes y hectáreas afectadas por periodo. |
| `GET /estadisticas/brotes/por-planta` | Brotes y hectáreas afectadas por planta. |
| `GET /estadisticas/brotes/por-patogeno` | Brotes y hectáreas afectadas por patógeno, ordenados de mayor a menor número de brotes. |


## 9. Validaciones principales

| Situación | Código HTTP |
|---|---|
| Datos obligatorios ausentes o vacíos, tipos incorrectos, valores fuera de los permitidos, secuencia genética con letras distintas de A, C, G, T en mayúsculas, fechas futuras, hectáreas menores o iguales a cero, secuencias de distinta longitud al verificar mutaciones, ID de ruta no válido, planta, enfermedad o patógeno inexistente al crear o actualizar un registro | 400 Bad Request |
| Registro pedido por su ID que no existe | 404 Not Found |
| Nombre científico repetido (plantas y patógenos), susceptibilidad repetida para la misma planta y enfermedad, o eliminación de una planta con dependencias | 409 Conflict |

Valores permitidos:

- `tipoCultivo` (plantas): hortaliza, frutal, cereal, ornamental, otro.
- `tipo` (patógenos): virus, hongo, bacteria, oomiceto, nematodo, insecto.
- `epocaRiesgo` (enfermedades): primavera, verano, otoño, invierno, todo_el_año.
- `nivel` (susceptibilidades): baja, media, alta.
- `tipo` (tratamientos): quimico, biologico, cultural.

Restricciones al eliminar:

- Patógeno: no se elimina si tiene enfermedades asociadas (400).
- Enfermedad: no se elimina si tiene tratamientos, susceptibilidades o brotes (400).
- Planta: no se elimina si tiene susceptibilidades, cultivos o brotes (409).


## 10. Pruebas y colección de Bruno

```bash
npm run build   # verifica que el código compila
npm run lint    # revisa el código con oxlint
npm test        # pruebas unitarias
```

La colección de Bruno está en la carpeta `entrega/entrega/bruno/`, organizada por recurso (Plantas, Patógenos, Enfermedades, Tratamientos, Susceptibilidades, Cultivos y Mutaciones, Brotes, Consultas Compuestas, Estadísticas y Eliminaciones protegidas). Incluye casos exitosos y casos que violan cada restricción del cliente.

Para usarla: abre Bruno, elige *Open Collection*, selecciona la carpeta `entrega/entrega/bruno/`, elige el entorno `local` y ejecuta las peticiones con la API corriendo y la base de datos cargada (la variable `baseUrl` apunta a `http://localhost:3000`).


## 11. Datos de ejemplo

El script `database/datos_ejemplo.sql` carga 9 plantas, 9 patógenos, 9 enfermedades, 12 tratamientos, 15 susceptibilidades, 11 cultivos y 24 brotes en distintas regiones y fechas. Un detalle útil para la sustentación: el cultivo 11 (lote `LOTE-DEMO-LONGITUD`) tiene una semilla de longitud distinta a la de referencia, para mostrar el error de la verificación de mutaciones.


## 12. Control de versiones (Gitflow)

- `main`: versiones estables.
- `develop`: integración de las funcionalidades.
- `feature/*`: una rama por funcionalidad (por ejemplo `feature/swagger-de-estadisticas`, `feature/validaciones-de-brotes`).
- `release/*` y `hotfix/*`: cuando se necesiten.

Siguiendo la indicación del curso, las ramas no se eliminan después de integrarlas.

Flujo de trabajo:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# desarrollar, compilar y hacer un commit por archivo
npm run build
git add ruta/del/archivo.ts
git commit -m "feat: descripción clara de lo que se hizo"
git push -u origin feature/nombre-funcionalidad
```

Después se abre un Pull Request hacia `develop`. Los archivos se agregan uno por uno (sin `git add .`) para no subir por error el `.env` ni artefactos generados.


## 13. Licencia

Proyecto académico desarrollado con fines educativos.