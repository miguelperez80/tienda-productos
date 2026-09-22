const manzana   = { id: 1, nombre: "Manzana roja", categoria: "fruta",   precio: 20.5,  stock: 8,  icono: "images/manzana.jpg" };
const pina      = { id: 2, nombre: "Piña",         categoria: "fruta",   precio: 15.35, stock: 5,  icono: "images/pina.jpg" };
const pera      = { id: 3, nombre: "Pera",         categoria: "fruta",   precio: 5.45,  stock: 12, icono: "images/pera.jpg" };
const melon     = { id: 4, nombre: "Melón",        categoria: "fruta",   precio: 6.15,  stock: 3,  icono: "images/melon.jpg" };
const zanahoria = { id: 5, nombre: "Zanahoria",    categoria: "verdura", precio: 3.2,   stock: 14, icono: "images/zanahoria.jpg" };
const tomate    = { id: 6, nombre: "Tomate",       categoria: "verdura", precio: 4.75,  stock: 0,  icono: "images/tomate.jpg" };
const jugo      = { id: 7, nombre: "Jugo natural", categoria: "bebida",  precio: 12.0,  stock: 6,  icono: "images/jugo.jpg" };
const cocoAgua  = { id: 8, nombre: "Agua de coco", categoria: "bebida",  precio: 8.9,   stock: 4,  icono: "images/aguaCoco.jpg" };
 
// Array que contiene todos los objetos del inventario
const inventarioProductos = [manzana, pina, pera, melon, zanahoria, tomate, jugo, cocoAgua];
 
// 'let' porque este valor cambia con cada aviso en pantalla
let temporizadorMensaje = null;
 
 
/* =========================================================================
   2. SELECCIÓN DEL DOM
   ========================================================================= */
const contenedorProductos = document.getElementById("lista-productos");
const mensajeSistema = document.getElementById("mensaje-sistema");
 
 
/* =========================================================================
   3. FUNCIONES AUXILIARES
   ========================================================================= */
 
// ---> Función flecha: convierte un número en texto de precio.
// toFixed(2) obliga a mostrar siempre dos decimales.
const formatearPrecio = (valor) => {
    return `$${valor.toFixed(2)}`;
};
 
// ---> Función declarativa: busca un producto por su id usando un ciclo for.
function buscarProductoPorId(idProducto) {
    for (let i = 0; i < inventarioProductos.length; i++) {
        if (inventarioProductos[i].id === idProducto) {
            return inventarioProductos[i]; // return corta el ciclo y sale
        }
    }
    return null; // null = valor vacío intencional
}
 
 
/* =========================================================================
   4. DIBUJAR EL CATÁLOGO
   ========================================================================= */
function renderizarProductos() {
 
    // Ciclo WHILE: mientras el contenedor tenga hijos, los va eliminando.
    // Es la forma de "limpiar" la zona antes de volver a dibujarla.
    while (contenedorProductos.firstChild) {
        contenedorProductos.removeChild(contenedorProductos.firstChild);
    }
 
    // Ciclo FOR: recorre el inventario producto por producto
    for (let i = 0; i < inventarioProductos.length; i++) {
        const producto = inventarioProductos[i];
 
        // Creamos la etiqueta desde cero y le ponemos su clase CSS
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta");
 
        // Condicional múltiple: tres estados posibles de inventario
        let textoStock = "";
        if (producto.stock === 0) {
            textoStock = "Agotado";
            tarjeta.classList.add("agotada");
        } else if (producto.stock <= 3) {
            textoStock = `¡Últimas ${producto.stock} unidades!`;
            tarjeta.classList.add("poco-stock");
        } else {
            textoStock = `Disponibles: ${producto.stock}`;
        }
 
        // Plantillas literales para armar el HTML interno de la tarjeta
        tarjeta.innerHTML = `
            <span class="icono-producto"><img src="${producto.icono}" alt="${producto.nombre}" style="width: 100%; height: auto;"></span>
            <h3 class="nombre-producto">${producto.nombre}</h3>
            <p class="etiqueta-categoria">${producto.categoria}</p>
            <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
            <p class="estado-stock">${textoStock}</p>
        `;
 
        // El botón se crea aparte para poder escucharlo con addEventListener
        const botonComprar = document.createElement("button");
        botonComprar.classList.add("boton");
        botonComprar.classList.add("boton-bloque");
 
        // Operador ternario para decidir el texto del botón
        botonComprar.textContent = (producto.stock === 0) ? "Sin existencias" : "Comprar";
 
        if (producto.stock === 0) {
            botonComprar.disabled = true;
        } else {
            botonComprar.addEventListener("click", () => {
                comprarProducto(producto.id);
            });
        }
 
        tarjeta.appendChild(botonComprar);
        contenedorProductos.appendChild(tarjeta);
    }
}
 
 
/* =========================================================================
   5. LÓGICA DE COMPRA
   ========================================================================= */
 
// ---> Función flecha: descuenta una unidad del inventario.
const comprarProducto = (idProducto) => {
    const producto = buscarProductoPorId(idProducto);
 
    // Condicional doble: solo vendemos si queda inventario
    if (producto.stock > 0) {
        producto.stock--;
        mostrarMensaje(`Compraste 1 ${producto.nombre}`, "exito");
        renderizarProductos(); // volvemos a dibujar con el stock actualizado
    } else {
        mostrarMensaje(`No queda inventario de ${producto.nombre}`, "error");
    }
};
 
 
/* =========================================================================
   6. MENSAJES DEL SISTEMA
   ========================================================================= */
function mostrarMensaje(texto, tipo) {
    mensajeSistema.textContent = texto;
 
    // Primero quitamos cualquier estado anterior
    mensajeSistema.classList.remove("oculto");
    mensajeSistema.classList.remove("mensaje-exito");
    mensajeSistema.classList.remove("mensaje-error");
 
    // SWITCH: elegimos qué clase CSS aplicar según el tipo de aviso
    switch (tipo) {
        case "exito":
            mensajeSistema.classList.add("mensaje-exito");
            break;
        case "error":
            mensajeSistema.classList.add("mensaje-error");
            break;
        default:
            mensajeSistema.classList.add("mensaje-exito");
    }
 
    // clearTimeout evita que un aviso viejo apague al nuevo antes de tiempo
    clearTimeout(temporizadorMensaje);
 
    // setTimeout: después de 3000 milisegundos escondemos el mensaje
    temporizadorMensaje = setTimeout(() => {
        mensajeSistema.classList.add("oculto");
    }, 3000);
}
 
 
/* =========================================================================
   7. INICIALIZACIÓN (Función autoejecutable - IIFE)
   ========================================================================= */
(function iniciarTienda() {
    console.log("Iniciando la tienda...");
    renderizarProductos();
    console.log(`Catálogo listo con ${inventarioProductos.length} productos.`);
})();
