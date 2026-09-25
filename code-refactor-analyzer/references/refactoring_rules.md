# Reglas de refactorizacion analizadas

`scripts/analyze.js` aplica tres reglas, definidas en el arreglo `RULES`. Cada regla
tiene un `id`, un titulo, una sugerencia y una funcion `test` que recibe una linea ya
saneada (sin comentarios ni contenido de strings) o la linea original, segun el campo
`target`.

## 1. No usar `var` (id: `var`)

**Que detecta:** cualquier aparicion del identificador `var` como palabra completa
(`/\bvar\b/`), es decir declaraciones sueltas y bucles `for (var i = 0; ...)`.

**Por que es mala practica:**

- `var` tiene alcance de funcion, no de bloque: una variable declarada dentro de un
  `if` sigue existiendo fuera de el y colisiona con variables homonimas.
- Permite redeclaracion silenciosa (`var x = 1; var x = 2`) sin error de sintaxis.
- En sloppy mode puede filtrarse al objeto global y contaminar el scope global.

**Como corregir:**

```js
// antes
var productos = []
for (var i = 0; i < items.length; i++) { total = total + items[i].price }

// despues
const productos = []
let total = 0
for (const item of items) { total += item.price }
```

Regla practica: `const` por defecto, `let` solo si la variable se reasigna.

## 2. No dejar `console.log` (id: `console-log`)

**Que detecta:** llamadas a `console.log`, tolerando espacios: `console . log (` y
`console.log(`.

**Por que es mala practica:**

- Es codigo de depuracion que debe quedar en el repositorio.
- Filtra datos internos (tokens, correos, ids de usuario) a los logs de produccion.
- No tiene niveles ni destino configurable, asi que se pierde cuando el proceso corre
  con la salida redirigida o el servidor captura stderr.

**Como corregir:** eliminar la llamada, o delegar en un logger propio con niveles.

```js
// antes
console.log('Cargando catalogo...')

// despues (en demo-app-corregida se acumula y se emite al final)
const mensajes = []
function registrar(mensaje) { mensajes.push(mensaje) }
process.stdout.write(`${mensajes.join('\n')}\n`)
```

En un proyecto real conviene usar el logger de la aplicacion o una libreria como
`pino` / `winston`, y proteger la depuracion con `import.meta.env.DEV`.

## 3. Maximo 80 caracteres por linea (id: `long-line`)

**Que detecta:** `linea.length > 80` sobre la linea original, incluidos indentacion y
saltos de linea CRLF (el archivo se divide con `/\r?\n/`, no queda el `\r` pegado).

**Por que es mala practica:**

- Una linea larga esconde la logica: obliga a desplazamiento horizontal para leer
  condiciones anidadas o concatenaciones.
- Dificulta los diffs: un cambio pequeno obliga a mover la linea completa.
- Es el limite de los estandares mas usados (Google, Airbnb con `printWidth: 80`).

**Como corregir:** partir la expresion, extraer constantes o usar plantillas.

```js
// antes (124 caracteres)
console.log('Agregado: ' + producto.nombre + ' | precio: ' + producto.precio)

// despues
const detalle = [
  `Agregado: ${producto.nombre}`,
  `precio: ${producto.precio}`
].join(' | ')
```

## Como se evita el ruido (falsos positivos)

Antes de aplicar `var` y `console-log` el script ejecuta `stripNoise(linea)`, que:

1. Borra comentarios de bloque en la misma linea: `/* ... */`.
2. Borra el comentario de linea: `// ...`.
3. Reemplaza el contenido de strings y plantillas por `""`.

 asi una linea como `const mensaje = 'no usar var'` no genera un hallazgo.

**Limitacion declarada:** es una heuristica por linea, no un parser AST. Casos que
pueden producir falsos positivos: un `//` dentro de un string
(`'https://ejemplo.com'`), un `/*` sin cierre en la misma linea, o la palabra `var`
dentro de una cadena con comillas desbalanceadas. Para analisis exacto hace falta un
parser como ESLint.
