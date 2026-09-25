# Manejo de errores y entradas invalidas

Principio: fallar rapido y con un mensaje accionable. El script nunca revienta con
rastreo de pila por un error de uso, y nunca escribe un reporte parcial o vacio que
pueda confundirse con "el archivo esta limpio".

## 1. Sin argumentos

`parseArgs` recibe `process.argv.slice(2)`. Si la lista esta vacia devuelve
`{ help: false, file: null }` y `run` aborta:

```text
[code-refactor-analyzer] Error: no se proporciono la ruta de un archivo para analizar.
[code-refactor-analyzer] Uso: node analyze.js <ruta-del-archivo>
```

Codigo de salida: `1`.

El mensaje incluye la forma correcta de invocarlo para que el usuario no tenga que
abrir el archivo de la skill.

## 2. Archivo inexistente

Orden de validacion en `readSource`:

1. `path.resolve(file)` para obtener la ruta absoluta. Si la ruta no es valida, error
   con el mensaje `no es una ruta valida`.
2. `fs.existsSync(absolute)`: si es `false`, error `el archivo "<ruta>" no existe`.
3. `fs.statSync(absolute).isDirectory()`: si es `true`, error `<ruta> es un directorio,
   se esperaba un archivo`. Este paso evita el `EISDIR` confuso de `readFileSync`.
4. `fs.readFileSync(absolute, 'utf-8')` dentro de un `try/catch`: cualquier error
   (permisos, archivo bloqueado, codificacion) se reporta como
   `no se pudo leer "<ruta>" (<motivo>)`.

```text
$ node code-refactor-analyzer/scripts/analyze.js demo-app/no-existe.js
[code-refactor-analyzer] Error: el archivo "demo-app/no-existe.js" no existe.
```

Codigo de salida: `1`.

## 3. Ayuda (`-h` / `--help`)

`parseArgs` detecta `-h` o `--help` en cualquier posicion e imprime la ayuda (sintaxis,
opciones y ejemplo) en `stdout`, terminando con codigo `0`. No se valida ninguna ruta.

## 4. Error inesperado

`main()` es asincrono (usa `import()` dinamico de `node:fs` y `node:path` para no
depender del tipo de modulo del proyecto). El `.catch` final imprime

```text
[code-refactor-analyzer] Error inesperado: <mensaje>
```

y termina con codigo `1`. Es la red de seguridad para que la skill nunca termine con
una excepcion sin explicar.

## 5. Archivos validos sin hallazgos

No es un error: el reporte se imprime con `Hallazgos totales: 0`, el mensaje
`Sin hallazgos: el archivo cumple las 3 reglas analizadas.` y el resumen en cero.
Codigo de salida: `0`.

Decision de diseno: el codigo de salida depende de la **validez de la entrada**, no de
la cantidad de hallazgos. Asi el reporte se puede redirigir a un archivo
(`> reporte.md`) sin que el comando parezca fallar, y un pipeline como
`node analyze.js a.js > r.md || echo fallo` solo se activa por un problema real de uso.

## 6. Donde va cada mensaje

- `stdout` (`process.stdout.write`): el reporte y la ayuda. Se puede redirigir o
  pipear sin perder nada.
- `stderr` (`process.stderr.write`): todos los errores, con el prefijo
  `[code-refactor-analyzer]` para distinguirlos del codigo de la aplicacion analizada.
