---
name: code-refactor-analyzer
description: Analiza archivos de codigo fuente linea por linea, detecta malas practicas (uso de var, console.log y lineas de mas de 80 caracteres) y genera un reporte de refactorizacion en Markdown. Usar cuando se revisa codigo antes de un commit o pull request, o cuando se pide una lista de problemas de estilo/legibilidad.
version: 1.0.0
author: Sebhastian Campero
---

# Code Refactor Analyzer

## ¿Cuándo y para qué usar esta skill?

Usala cuando necesites:

- Revisar un archivo de codigo antes de un commit o pull request y obtener una lista
  objetiva de problemas de estilo y legibilidad.
- Auditar codigo heredado o escrito rapido para encontrar la deuda tecnica mas comun.
- Verificar, despues de un refactor, que un archivo ya no tiene `var`, `console.log`
  ni lineas largas.
- Pedirle al agente que "revise malas practicas" o "revise el estilo del codigo" sin
  tener que definir cada regla a mano.

No usar para: analisis semantico profundo, deteccion de bugs de logica, metricas de
complejidad, auditoria de seguridad o proyectos que no sean JavaScript/TypeScript.

## Requisitos

- Node.js v16.0 o superior (probado en v18/v20/v22).
- No requiere `npm install`: el script solo usa modulos nativos (`node:fs`, `node:path`).
- No hace falta `package.json`: funciona dentro de proyectos ESM y CommonJS.

## Estructura de archivos

```
code-refactor-analyzer/
├── SKILL.md                          Este archivo
├── scripts/
│   └── analyze.js                    Analizador ejecutable
├── references/
│   ├── refactoring_rules.md          Las 3 reglas y como aplicarlas
│   └── error-handling.md             Comportamiento ante entradas invalidas
└── assets/
    └── report-template.md            Formato del reporte generado
```

## Uso rapido

```bash
node code-refactor-analyzer/scripts/analyze.js demo-app/index.js
node code-refactor-analyzer/scripts/analyze.js --help
```

Tambien se puede redirigir el reporte a un archivo:

```bash
node code-refactor-analyzer/scripts/analyze.js src/App.jsx > reporte.md
```

## Reglas analizadas

| id | regla | como se detecta |
| --- | --- | --- |
| `var` | No declarar con `var` | Expresion regular `\bvar\b` sobre la linea sin comentarios ni strings |
| `console-log` | No dejar depuracion en consola | Expresion regular `\bconsole\s*\.\s*log\b` sobre la linea sin comentarios ni strings |
| `long-line` | Maximo 80 caracteres por linea | `linea.length > 80` sobre la linea original |

Detalles y justificación en `references/refactoring_rules.md`.

## Salida

El reporte se escribe en `stdout` con esta estructura (plantilla completa en
`assets/report-template.md`):

1. Encabezado: archivo, ruta absoluta, version, lineas revisadas y total de hallazgos.
2. Una seccion por regla con los hallazgos (linea, contenido y sugerencia).
3. Resumen por regla y cierre del analisis.

Codigos de salida: `0` si el analisis se completo (con o sin hallazgos) y `1` si la
entrada fue invalida (sin argumento, archivo inexistente, directorio o error de lectura).
Los mensajes de error van a `stderr` y no contaminan el reporte.
Ver `references/error-handling.md` para el detalle.

## Ejemplos incluidos

- `demo-app/index.js`: archivo con las 3 malas practicas (13 hallazgos).
- `demo-app-corregida/index.js`: mismo comportamiento, 0 hallazgos.
