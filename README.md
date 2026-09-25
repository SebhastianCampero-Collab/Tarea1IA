# Code Refactor Analyzer (skill para OpenCode / Claude Code)

Skill que analiza archivos de codigo fuente linea por linea, detecta malas practicas
y genera un reporte de refactorizacion en Markdown. Autor: **Sebhastian Campero**.

Reglas detectadas:

| Regla | Que busca |
| --- | --- |
| `var` | Declaraciones con `var` en lugar de `const`/`let` |
| `console-log` | Llamadas a `console.log` olvidadas en el codigo |
| `long-line` | Lineas de mas de 80 caracteres |

## Estructura del proyecto

```
.
├── code-refactor-analyzer/
│   ├── SKILL.md                      Metadatos YAML, cuando usarla y uso rapido
│   ├── scripts/
│   │   └── analyze.js                Analizador en Node.js puro
│   ├── references/
│   │   ├── refactoring_rules.md      Las 3 reglas explicadas
│   │   └── error-handling.md         Entradas invalidas y codigos de salida
│   └── assets/
│       └── report-template.md        Formato del reporte generado
├── demo-app/
│   └── index.js                      Codigo con malas practicas (13 hallazgos)
├── demo-app-corregida/
│   └── index.js                      Mismo codigo corregido (0 hallazgos)
├── src/                              Tienda React (proyecto base, sin relacion)
└── README.md                         Este archivo
```

## Requisitos

- **Node.js v16.0 o superior.** Verificar con `node --version`.
- **Sin dependencias externas.** El script solo usa `node:fs` y `node:path`, asi que no
  hace falta `npm install` para usar la skill. Funciona en proyectos ESM y CommonJS.
- Opcional: `npm i` si tambien quieres levantar la tienda React del proyecto base.

## Instalacion

### Opcion A: usar la skill dentro de este repositorio

No hay nada que compilar ni instalar. La skill ya esta en `code-refactor-analyzer/` y se
ejecuta directamente:

```bash
node code-refactor-analyzer/scripts/analyze.js demo-app/index.js
```

### Opcion B: instalarla como skill de un agente

1. Copiar la carpeta `code-refactor-analyzer` completa (el agente necesita `SKILL.md` y
   la referencia a `scripts/analyze.js`):

   ```bash
   # Claude Code
   xcopy /E /I code-refactor-analyzer "%USERPROFILE%\.claude\skills\code-refactor-analyzer"

   # OpenCode
   xcopy /E /I code-refactor-analyzer "%USERPROFILE%\.config\opencode\skill\code-refactor-analyzer"
   ```

2. Reiniciar el agente para que detecte el `SKILL.md`.
3. Pedirle things como: *"analiza `src/App.jsx` con la skill code-refactor-analyzer"* o
   *"revisa malas practicas de `demo-app/index.js`"*.

El agente lee el frontmatter de `code-refactor-analyzer/SKILL.md` para saber cuando
activar la skill, y para el trabajo concreto ejecuta
`node <ruta>/code-refactor-analyzer/scripts/analyze.js <archivo>`.

## Uso

```bash
# Analizar un archivo
node code-refactor-analyzer/scripts/analyze.js src/App.jsx

# Con ruta relativa, desde la raiz del proyecto
node code-refactor-analyzer/scripts/analyze.js demo-app/index.js

# Guardar el reporte
node code-refactor-analyzer/scripts/analyze.js src/App.jsx > reporte.md

# Ver la ayuda
node code-refactor-analyzer/scripts/analyze.js --help
```

Argumentos:

| Argumento | Descripcion |
| --- | --- |
| `<ruta-del-archivo>` | Archivo a analizar (obligatorio, posicion 2) |
| `-h`, `--help` | Muestra la ayuda y termina con codigo `0` |

Codigos de salida: `0` el analisis se completo (haya hallazgos o no), `1` entrada
invalida.

## Pruebas y Manejo de Errores

### Caso 1: exito con hallazgos (`demo-app/index.js`)

```bash
node code-refactor-analyzer/scripts/analyze.js demo-app/index.js
```

Salida real (13 hallazgos: 7 de `var`, 4 de `console.log` y 2 lineas largas):

```markdown
# Reporte de analisis de codigo

- **Archivo analizado:** demo-app\index.js
- **Ruta absoluta:** F:\Tarea1IA\demo-app\index.js
- **Generado por:** code-refactor-analyzer v1.0.0
- **Lineas revisadas:** 50
- **Hallazgos totales:** 13

## Uso de "var" - 7 hallazgos

- Linea 13: var productos = []
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.
- Linea 14: var total = 0
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.
- Linea 19: for (var i = 0; i < catalogo.length; i++) {
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.
- Linea 20: var producto = catalogo[i]
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.
- Linea 33: var mayor = productos[0]
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.
- Linea 35: for (var i = 0; i < productos.length; i++) {
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.
- Linea 47: var caro = productoMasCaro()
  - Sugerencia: Declarar con "const" si no se reasigna, o con "let" si cambia.

## Uso de "console.log" - 4 hallazgos

- Linea 17: console.log('Cargando catalogo...')
  - Sugerencia: Quitar la depuracion o delegarla en un logger con niveles.
- Linea 25: console.log('Agregado: ' + producto.nombre + ' | precio: ' + producto.precio + ' | stock restante: ' + producto.stock)
  - Sugerencia: Quitar la depuracion o delegarla en un logger con niveles.
- Linea 29: console.log('Productos cargados: ' + productos.length + ' | total: ' + total)
  - Sugerencia: Quitar la depuracion o delegarla en un logger con niveles.
- Linea 48: console.log('Producto mas caro: ' + caro.nombre + ' precio: ' + caro.precio + ' unidades: ' + caro.stock)
  - Sugerencia: Quitar la depuracion o delegarla en un logger con niveles.

## Lineas de mas de 80 caracteres - 2 hallazgos

- Linea 25 (124 caracteres): console.log('Agregado: ' + producto.nombre + ' | precio: ' + producto.precio + ' | stock restante: ' + producto.stock)
  - Sugerencia: Dividir la expresion en varias lineas o extraer constantes.
- Linea 48 (107 caracteres): console.log('Producto mas caro: ' + caro.nombre + ' precio: ' + caro.precio + ' unidades: ' + caro.stock)
  - Sugerencia: Dividir la expresion en varias lineas o extraer constantes.

## Resumen por regla

- var: 7
- console-log: 4
- long-line: 2

Analisis completado: 1 archivo revisado, 3 reglas aplicadas.
```

```bash
$LASTEXITCODE   # 0
```

### Caso 2: exito sin hallazgos (`demo-app-corregida/index.js`)

```bash
node code-refactor-analyzer/scripts/analyze.js demo-app-corregida/index.js
```

```markdown
# Reporte de analisis de codigo

- **Archivo analizado:** demo-app-corregida\index.js
- **Ruta absoluta:** F:\Tarea1IA\demo-app-corregida\index.js
- **Generado por:** code-refactor-analyzer v1.0.0
- **Lineas revisadas:** 63
- **Hallazgos totales:** 0

Sin hallazgos: el archivo cumple las 3 reglas analizadas.

## Resumen por regla

- var: 0
- console-log: 0
- long-line: 0

Analisis completado: 1 archivo revisado, 3 reglas aplicadas.
```

Comprobacion funcional: los dos demos ejecutan exactamente la misma logica.

```bash
node demo-app/index.js
node demo-app-corregida/index.js
```

```text
Cargando catalogo...
Agregado: Teclado mecanico | precio: 4500 | stock restante: 12
Agregado: Mouse ergonomico | precio: 3200 | stock restante: 30
Agregado: Monitor 27 pulgadas | precio: 18900 | stock restante: 7
Productos cargados: 3 | total: 26600
Producto mas caro: Monitor 27 pulgadas precio: 18900 unidades: 7
```

### Caso 3: error, archivo inexistente

```bash
node code-refactor-analyzer/scripts/analyze.js demo-app/no-existe.js
```

```text
[code-refactor-analyzer] Error: el archivo "demo-app\no-existe.js" no existe.
```

El mensaje va a `stderr`, no se imprime reporte y el proceso termina con codigo `1`:

```bash
$LASTEXITCODE   # 1
```

### Caso 4: error, sin argumentos

```bash
node code-refactor-analyzer/scripts/analyze.js
```

```text
[code-refactor-analyzer] Error: no se proporciono la ruta de un archivo para analizar.
[code-refactor-analyzer] Uso: node analyze.js <ruta-del-archivo>
```

Codigo de salida: `1`.

### Caso 5: error, se pasa un directorio

```bash
node code-refactor-analyzer/scripts/analyze.js src
```

```text
[code-refactor-analyzer] Error: "src" es un directorio, se esperaba un archivo.
```

Codigo de salida: `1`.

### Caso 6: ayuda

```bash
node code-refactor-analyzer/scripts/analyze.js --help
```

```text
Uso: node analyze.js <ruta-del-archivo>

Opciones:
  -h, --help   Muestra esta ayuda y termina.

Ejemplo:
  node analyze.js demo-app/index.js

Reglas aplicadas: uso de "var", uso de "console.log" y lineas de mas de
80 caracteres.
```

Codigo de salida: `0`.

### Tabla resumen de pruebas

| # | Escenario | Comando | `stdout` | `stderr` | Codigo |
| --- | --- | --- | --- | --- | --- |
| 1 | Con hallazgos | `analyze.js demo-app/index.js` | Reporte (13) | - | `0` |
| 2 | Sin hallazgos | `analyze.js demo-app-corregida/index.js` | Reporte (0) | - | `0` |
| 3 | Archivo inexistente | `analyze.js demo-app/no-existe.js` | - | `Error: el archivo ... no existe.` | `1` |
| 4 | Sin argumentos | `analyze.js` | - | `Error: no se proporciono la ruta ...` | `1` |
| 5 | Directorio | `analyze.js src` | - | `Error: "src" es un directorio ...` | `1` |
| 6 | Ayuda | `analyze.js --help` | Ayuda | - | `0` |

## Notas de diseno

- **Sin dependencias:** todo el analisis usa `node:fs` y `node:path`. No hay
  `package.json` propio, no hay `node_modules` y no hay build.
- **Portable:** el script resuelve los modulos con `import()` dinamico, por eso funciona
  igual en un proyecto ESM (como este repo, `"type": "module"`) o en uno CommonJS.
- **Sin falsos positivos obvios:** antes de buscar `var` y `console.log` se eliminan
  comentarios y contenido de strings (`stripNoise`). Es una heuristica por linea, no un
  parser AST; las limitaciones estan documentadas en
  `code-refactor-analyzer/references/refactoring_rules.md`.
- **CRLF:** los archivos se parten con `/\r?\n/`, asi que en Windows los numeros de
  linea y las longitudes son correctos.
- **Codigo de salida ligado a la entrada, no a los hallazgos:** encontrar problemas no
  hace fallar el comando, para poder redirigir el reporte con `> reporte.md`.
- **Mensajes en ASCII:** la salida del script evita acentos para no depender de la
  codificacion de la consola de Windows. Los `.md` si usan acentuacion.

---

## Anexo: Tienda Tech (proyecto base del repositorio)

Este repositorio ya incluia un ejercicio de depuracion sobre la tienda React de `src/`.
La tienda no se modifico y no forma parte de la skill; se documenta aqui para no perder
la referencia original.

### Como ejecutarla

```bash
npm install
npm run dev
```

Abre la direccion que muestra la terminal (normalmente http://localhost:5173).

### Tarea original

1. Usa la aplicacion (busca, filtra, agrega al carrito, cambia cantidades, elimina, paga) y anota todo lo que funcione o se vea mal.
2. Encuentra la causa de cada error en el codigo.
3. Corrígelos. Puedes usar IA, pero debes **entender y probar** cada cambio.
4. Entrega, por cada uno de los 10 errores:
   - Qué pasaba (síntoma).
   - En qué archivo y línea estaba la causa.
   - Cómo lo corregiste.
   - El prompt que usaste con la IA y si tuviste que corregirlo.

Los datos vienen de https://dummyjson.com/products
