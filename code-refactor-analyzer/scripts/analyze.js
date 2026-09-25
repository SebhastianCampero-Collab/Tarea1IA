/**
 * code-refactor-analyzer
 * Analiza un archivo de codigo fuente linea por linea y escribe un reporte
 * en Markdown con las malas practicas encontradas.
 *
 * Node.js puro: no usa ninguna libreria externa (solo modulos nativos).
 * Compatible con proyectos ESM y CommonJS.
 *
 *   node analyze.js <ruta-del-archivo>
 *   node analyze.js --help
 */

const MAX_LINE_LENGTH = 80
const SKILL_NAME = 'code-refactor-analyzer'
const SKILL_VERSION = '1.0.0'

const RULES = [
  {
    id: 'var',
    title: 'Uso de "var"',
    suggestion: 'Declarar con "const" si no se reasigna, o con "let" si cambia.',
    target: 'code',
    test: (code) => /\bvar\b/.test(code)
  },
  {
    id: 'console-log',
    title: 'Uso de "console.log"',
    suggestion: 'Quitar la depuracion o delegarla en un logger con niveles.',
    target: 'code',
    test: (code) => /\bconsole\s*\.\s*log\b/.test(code)
  },
  {
    id: 'long-line',
    title: `Lineas de mas de ${MAX_LINE_LENGTH} caracteres`,
    suggestion: 'Dividir la expresion en varias lineas o extraer constantes.',
    target: 'raw',
    test: (line) => line.length > MAX_LINE_LENGTH
  }
]

const USAGE = [
  'Uso: node analyze.js <ruta-del-archivo>',
  '',
  'Opciones:',
  '  -h, --help   Muestra esta ayuda y termina.',
  '',
  'Ejemplo:',
  '  node analyze.js demo-app/index.js',
  '',
  'Reglas aplicadas: uso de "var", uso de "console.log" y lineas de mas de',
  `${MAX_LINE_LENGTH} caracteres.`
].join('\n')

function writeOut (text) {
  process.stdout.write(`${text}\n`)
}

function writeErr (text) {
  process.stderr.write(`${text}\n`)
}

function fail (message) {
  writeErr(`[${SKILL_NAME}] Error: ${message}`)
  process.exit(1)
}

function printUsage () {
  writeOut(USAGE)
}

function parseArgs (argv) {
  const args = argv.slice(2)

  if (args.includes('-h') || args.includes('--help')) {
    return { help: true, file: null }
  }

  if (args.length === 0) {
    return { help: false, file: null }
  }

  return { help: false, file: args[0] }
}

/**
 * Elimina comentarios y contenido de strings para no reportar falsos positivos.
 * Es una heuristica por linea (no reemplaza a un parser AST).
 */
function stripNoise (line) {
  return line
    .replace(/\/\*.*?\*\//g, '')
    .replace(/\/\/.*$/, '')
    .replace(/(["'`])[^"'`]*\1/g, '""')
}

function readSource (fs, path, file) {
  let absolute

  try {
    absolute = path.resolve(file)
  } catch {
    fail(`"${file}" no es una ruta valida.`)
  }

  if (!fs.existsSync(absolute)) {
    fail(`el archivo "${file}" no existe.`)
  }

  if (fs.statSync(absolute).isDirectory()) {
    fail(`"${file}" es un directorio, se esperaba un archivo.`)
  }

  try {
    return { absolute, content: fs.readFileSync(absolute, 'utf-8') }
  } catch (error) {
    fail(`no se pudo leer "${file}" (${error.message}).`)
  }
}

function analyze (lines) {
  const findings = new Map()
  RULES.forEach((rule) => findings.set(rule.id, []))

  lines.forEach((raw, index) => {
    const code = stripNoise(raw)

    RULES.forEach((rule) => {
      const subject = rule.target === 'raw' ? raw : code

      if (rule.test(subject)) {
        findings.get(rule.id).push({
          line: index + 1,
          content: raw.trim(),
          length: raw.length
        })
      }
    })
  })

  return findings
}

function buildReport ({ file, absolute, lineCount, findings }) {
  const total = RULES.reduce(
    (sum, rule) => sum + findings.get(rule.id).length,
    0
  )

  const out = []
  out.push('# Reporte de analisis de codigo')
  out.push('')
  out.push(`- **Archivo analizado:** ${file}`)
  out.push(`- **Ruta absoluta:** ${absolute}`)
  out.push(`- **Generado por:** ${SKILL_NAME} v${SKILL_VERSION}`)
  out.push(`- **Lineas revisadas:** ${lineCount}`)
  out.push(`- **Hallazgos totales:** ${total}`)
  out.push('')

  if (total === 0) {
    out.push('Sin hallazgos: el archivo cumple las 3 reglas analizadas.')
    out.push('')
  }

  RULES.forEach((rule) => {
    const list = findings.get(rule.id)
    const plural = list.length === 1 ? 'hallazgo' : 'hallazgos'

    if (list.length === 0) return

    out.push(`## ${rule.title} - ${list.length} ${plural}`)
    out.push('')

    list.forEach((finding) => {
      const label =
        rule.target === 'raw'
          ? `Linea ${finding.line} (${finding.length} caracteres)`
          : `Linea ${finding.line}`

      out.push(`- ${label}: ${finding.content}`)
      out.push(`  - Sugerencia: ${rule.suggestion}`)
    })

    out.push('')
  })

  out.push('## Resumen por regla')
  out.push('')
  RULES.forEach((rule) => {
    out.push(`- ${rule.id}: ${findings.get(rule.id).length}`)
  })
  out.push('')
  out.push(
    `Analisis completado: 1 archivo revisado, ${RULES.length} reglas aplicadas.`
  )

  return out.join('\n')
}

function run (fs, path, argv) {
  const { help, file } = parseArgs(argv)

  if (help) {
    printUsage()
    return
  }

  if (!file) {
    fail('no se proporciono la ruta de un archivo para analizar.\n' +
      `[${SKILL_NAME}] Uso: node analyze.js <ruta-del-archivo>`)
  }

  const { absolute, content } = readSource(fs, path, file)
  const lines = content.split(/\r?\n/)
  const findings = analyze(lines)

  writeOut(buildReport({ file, absolute, lineCount: lines.length, findings }))
}

async function main () {
  const fs = await import('node:fs')
  const path = await import('node:path')
  run(fs, path, process.argv)
}

main().catch((error) => {
  writeErr(`[${SKILL_NAME}] Error inesperado: ${error.message}`)
  process.exit(1)
})
