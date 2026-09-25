/**
 * Demo app corregida: mismo comportamiento que demo-app/index.js,
 * pero cumple las 3 reglas que verifica el analyzer.
 */

const catalogo = [
  { id: 1, nombre: 'Teclado mecanico', precio: 4500, stock: 12 },
  { id: 2, nombre: 'Mouse ergonomico', precio: 3200, stock: 30 },
  { id: 3, nombre: 'Monitor 27 pulgadas', precio: 18900, stock: 7 },
  { id: 4, nombre: 'Webcam HD', precio: 5100, stock: 0 }
]

const mensajes = []

function registrar(mensaje) {
  mensajes.push(mensaje)
}

function cargarCatalogo() {
  registrar('Cargando catalogo...')

  const disponibles = catalogo.filter((item) => item.stock > 0)
  const total = disponibles.reduce(
    (suma, item) => suma + item.precio,
    0
  )

  disponibles.forEach((item) => {
    const detalle = [
      `Agregado: ${item.nombre}`,
      `precio: ${item.precio}`,
      `stock restante: ${item.stock}`
    ].join(' | ')

    registrar(detalle)
  })

  registrar(`Productos cargados: ${disponibles.length} | total: ${total}`)

  return disponibles
}

function productoMasCaro(lista) {
  return lista.reduce((mayor, item) =>
    item.precio > mayor.precio ? item : mayor
  )
}

const productos = cargarCatalogo()

if (productos.length > 0) {
  const caro = productoMasCaro(productos)
  const resumen = [
    `Producto mas caro: ${caro.nombre}`,
    `precio: ${caro.precio}`,
    `unidades: ${caro.stock}`
  ].join(' ')

  registrar(resumen)
}

process.stdout.write(`${mensajes.join('\n')}\n`)
