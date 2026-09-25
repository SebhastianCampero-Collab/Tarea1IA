/**
 * Demo app con malas practicas deliberadas.
 * No usar como referencia: existe solo para probar el analyzer.
 */

const catalogo = [
  { id: 1, nombre: 'Teclado mecanico', precio: 4500, stock: 12 },
  { id: 2, nombre: 'Mouse ergonomico', precio: 3200, stock: 30 },
  { id: 3, nombre: 'Monitor 27 pulgadas', precio: 18900, stock: 7 },
  { id: 4, nombre: 'Webcam HD', precio: 5100, stock: 0 }
]

var productos = []
var total = 0

function cargarCatalogo() {
  console.log('Cargando catalogo...')

  for (var i = 0; i < catalogo.length; i++) {
    var producto = catalogo[i]

    if (producto.stock > 0) {
      productos.push(producto)
      total = total + producto.precio
      console.log('Agregado: ' + producto.nombre + ' | precio: ' + producto.precio + ' | stock restante: ' + producto.stock)
    }
  }

  console.log('Productos cargados: ' + productos.length + ' | total: ' + total)
}

function productoMasCaro() {
  var mayor = productos[0]

  for (var i = 0; i < productos.length; i++) {
    if (productos[i].precio > mayor.precio) {
      mayor = productos[i]
    }
  }

  return mayor
}

cargarCatalogo()

if (productos.length > 0) {
  var caro = productoMasCaro()
  console.log('Producto mas caro: ' + caro.nombre + ' precio: ' + caro.precio + ' unidades: ' + caro.stock)
}
