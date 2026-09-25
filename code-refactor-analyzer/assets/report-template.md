# Plantilla del reporte

Formato que produce `scripts/analyze.js` en `stdout`. Los marcadores `{{...}}` se
reemplazan en tiempo de ejecucion; las secciones de hallazgo solo se emiten si la regla
tiene resultados.

```markdown
# Reporte de analisis de codigo

- **Archivo analizado:** {{ruta_argumento}}
- **Ruta absoluta:** {{ruta_absoluta}}
- **Generado por:** {{nombre_skill}} v{{version}}
- **Lineas revisadas:** {{cantidad_lineas}}
- **Hallazgos totales:** {{total}}

## {{titulo_regla}} - {{cantidad}} {{hallazgos}}

- Linea {{numero}}: {{contenido_linea}}
  - Sugerencia: {{sugerencia}}
- Linea {{numero}} ({{longitud}} caracteres): {{contenido_linea}}
  - Sugerencia: {{sugerencia}}

## Resumen por regla

- {{id_regla}}: {{cantidad}}
- {{id_regla}}: {{cantidad}}
- {{id_regla}}: {{cantidad}}

Analisis completado: 1 archivo revisado, {{cantidad_reglas}} reglas aplicadas.
```

## Variantes

**Sin hallazgos** (total = 0): se omiten todas las secciones de regla y en su lugar se
imprime una sola linea antes del resumen.

```markdown
Sin hallazgos: el archivo cumple las 3 reglas analizadas.
```

**Hallazgo de linea larga:** a diferencia de `var` y `console-log`, el prefijo incluye
la longitud medida de la linea para que el leitor sepa cuanto hay que recortar.

**Cantidad singular:** el titulo usa `1 hallazgo` o `N hallazgos` segun corresponda.

## Como redirigir el reporte a un archivo

```bash
node code-refactor-analyzer/scripts/analyze.js src/App.jsx > reporte.md
```

En PowerShell, para ver el reporte y guardarlo a la vez:

```powershell
node code-refactor-analyzer/scripts/analyze.js src/App.jsx | Tee-Object reporte.md
```

El reporte es Markdown plano, sin caracteres de control, pensado para pegarse en un
issue o pull request.
