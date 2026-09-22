/* =========================================================================
   1. VARIABLES Y TIPOS DE DATOS (nuestra "base de datos" simulada)
   ========================================================================= */
const manzana   = { id: 1, nombre: "manzana", categoria: "fruta",   precio: 20.5,  stock: 8,  icono: "images/manzana.jpg" };
const pina      = { id: 2, nombre: "pina",         categoria: "fruta",   precio: 15.35, stock: 5,  icono: "images/pina.jpg" };
const pera      = { id: 3, nombre: "pera",         categoria: "fruta",   precio: 5.45,  stock: 12, icono: "images/pera.jpg" };
const melon     = { id: 4, nombre: "melon",        categoria: "fruta",   precio: 6.15,  stock: 3,  icono: "images/melon.jpg" };
const zanahoria = { id: 5, nombre: "zanahoria",    categoria: "verdura", precio: 3.2,   stock: 14, icono: "images/zanahoria.jpg" };
const tomate    = { id: 6, nombre: "tomate",       categoria: "verdura", precio: 4.75,  stock: 0,  icono: "images/tomate.jpg" };
const jugo      = { id: 7, nombre: "jugo", categoria: "bebida",  precio: 12.0,  stock: 6,  icono: "images/jugo.jpg" };
const cocoAgua  = { id: 8, nombre: "aguaCoco", categoria: "bebida",  precio: 8.9,   stock: 4,  icono: "images/aguaCoco.jpg" };
 
// Array que contiene todos los objetos del inventario
const inventarioProductos = [manzana, pina, pera, melon, zanahoria, tomate, jugo, cocoAgua];
 
// Reglas de negocio: valores fijos, por eso van en MAYÚSCULAS
const COSTO_ENVIO = 8;
const MINIMO_ENVIO_GRATIS = 60;
 
// Estado de la aplicación: usamos 'let' porque estos valores SÍ cambian
let carrito = [];               // Array de objetos {id, nombre, precio, icono, cantidad}
 
 
// 'let' porque este valor cambia con cada aviso en pantalla
let temporizadorMensaje = null;
 
 
/* =========================================================================
   2. SELECCIÓN DEL DOM
   ========================================================================= */
const contenedorProductos = document.getElementById("lista-productos");
 
const contenedorCarrito   = document.getElementById("items-carrito");
const contadorCarrito     = document.getElementById("contador-carrito");
const textoSubtotal = document.getElementById("texto-subtotal");
const textoEnvio    = document.getElementById("texto-envio");
const textoTotal    = document.getElementById("texto-total");
 
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
 
 
 
 
// ---> Busca una línea dentro del carrito
function buscarItemEnCarrito(idProducto) {
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id === idProducto) {
            return carrito[i];
        }
    }
    return null;
}
 
// ---> Devuelve un carrito NUEVO sin el producto indicado.
// Así evitamos borrar elementos "a la fuerza": construimos otra lista.
const carritoSinProducto = (idProducto) => {
    const nuevoCarrito = [];
    carrito.forEach((item) => {
        if (item.id !== idProducto) {
            nuevoCarrito.push(item);
        }
    });
    return nuevoCarrito;
};
 
// ---> Cuenta cuántas unidades hay en total en el carrito
const contarUnidades = () => {
    let unidades = 0;
    carrito.forEach((item) => {
        unidades = unidades + item.cantidad;
    });
    return unidades;
};
 
// ---> Calcula subtotal, envío y total. Devuelve un Objeto con los tres valores.
const calcularTotales = () => {
    let subtotal = 0;
 
    // forEach: ejecuta una acción por cada elemento de la lista
    carrito.forEach((item) => {
        subtotal = subtotal + (item.precio * item.cantidad);
    });
 
    // Condicional múltiple: el envío depende de dos reglas
    let envio = COSTO_ENVIO;
    if (carrito.length === 0) {
        envio = 0;
    } else if (subtotal >= MINIMO_ENVIO_GRATIS) {
        envio = 0;
    }
 
    return {
        subtotal: subtotal,
        envio: envio,
        total: subtotal + envio
    };
};
 
 
 
 
 
 
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
 
 
        // NUEVO EN LA V2: avisamos cuántas unidades ya lleva el usuario
        const itemEnCarrito = buscarItemEnCarrito(producto.id);
        const textoEnCarrito = (itemEnCarrito === null)
            ? ""
            : `Ya llevas ${itemEnCarrito.cantidad} en el carrito`;
 
 
 
        // Plantillas literales para armar el HTML interno de la tarjeta
        tarjeta.innerHTML = `
            <span class="icono-producto"><img src="${producto.icono}" alt="${producto.nombre}" style="width: 100%; height: auto;"></span>
            <h3 class="nombre-producto">${producto.nombre}</h3>
            <p class="etiqueta-categoria">${producto.categoria}</p>
            <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
            <p class="estado-stock">${textoStock}</p>
            <p class="mini-dato">${textoEnCarrito}</p>
        `;
 
        // El botón se crea aparte para poder escucharlo con addEventListener
        const botonComprar = document.createElement("button");
        botonComprar.classList.add("boton");
        botonComprar.classList.add("boton-bloque");
 
        // Operador ternario para decidir el texto del botón
        //botonComprar.textContent = (producto.stock === 0) ? "Sin existencias" : "Comprar";
 
        if (producto.stock === 0) {
            botonComprar.textContent = "Sin existencias";
            botonComprar.disabled = true;
        } else {
            botonComprar.textContent = "Agregar al carrito";
            botonComprar.addEventListener("click", () => {
                agregarAlCarrito(producto.id);
            });
        }
 
        tarjeta.appendChild(botonComprar);
        contenedorProductos.appendChild(tarjeta);
    }
}
 
 
/* =========================================================================
   5. LÓGICA DE COMPRA
   ========================================================================= */
 
// ---> Agrega una unidad al carrito y la descuenta del inventario
const agregarAlCarrito = (idProducto) => {
    const producto = buscarProductoPorId(idProducto);
 
    if (producto.stock > 0) {
        const item = buscarItemEnCarrito(idProducto);
 
        if (item === null) {
            // Todavía no está en el carrito: creamos su línea
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                icono: producto.icono,
                cantidad: 1
            });
        } else {
            // Ya estaba: solo sumamos una unidad a esa línea
            item.cantidad++;
        }
 
        producto.stock--;
        mostrarMensaje(`${producto.nombre} agregado al carrito`, "exito");
        actualizarPantalla();
    } else {
        mostrarMensaje(`No queda inventario de ${producto.nombre}`, "error");
    }
};
 
// ---> Suma o resta una unidad de una línea. 'cambio' vale 1 o -1.
function cambiarCantidad(idProducto, cambio) {
    const item = buscarItemEnCarrito(idProducto);
    const producto = buscarProductoPorId(idProducto);
 
    if (cambio === 1) {
        if (producto.stock > 0) {
            item.cantidad++;
            producto.stock--;
        } else {
            mostrarMensaje(`No hay más unidades de ${producto.nombre}`, "error");
        }
    } else {
        item.cantidad--;
        producto.stock++; // la unidad regresa al inventario
 
        // Si la línea llegó a cero, la sacamos del carrito
        if (item.cantidad === 0) {
            carrito = carritoSinProducto(idProducto);
        }
    }
 
    actualizarPantalla();
}
 
// ---> Elimina la línea completa y devuelve todo su inventario
function quitarDelCarrito(idProducto) {
    const item = buscarItemEnCarrito(idProducto);
    const producto = buscarProductoPorId(idProducto);
 
    producto.stock = producto.stock + item.cantidad;
    carrito = carritoSinProducto(idProducto);
 
    mostrarMensaje(`${producto.nombre} se quitó del carrito`, "error");
    actualizarPantalla();
}
 
 
 
/* =========================================================================
   6. DIBUJAR EL CARRITO Y EL RESUMEN
   ========================================================================= */
 
// ---> Función expresiva: se guarda dentro de una constante
const renderizarCarrito = function () {
 
    // Ciclo WHILE para limpiar el panel antes de volver a dibujarlo
    while (contenedorCarrito.firstChild) {
        contenedorCarrito.removeChild(contenedorCarrito.firstChild);
    }
 
    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.classList.add("carrito-vacio");
        vacio.textContent = "Tu carrito está vacío. Agrega productos del catálogo.";
        contenedorCarrito.appendChild(vacio);
        return; // salimos: no hay nada más que dibujar
    }
 
    carrito.forEach((item) => {
        const linea = document.createElement("div");
        linea.classList.add("linea-carrito");
 
        const info = document.createElement("div");
        info.innerHTML = `
            <p class="nombre-linea"> 
            <img src="images/${item.nombre}.jpg" style="width: 20%; height: 100%;"> ${item.nombre}</p>
            <p class="detalle-linea">${item.cantidad} × ${formatearPrecio(item.precio)} = ${formatearPrecio(item.precio * item.cantidad)}</p>
        `;
 
        const controles = document.createElement("div");
        controles.classList.add("controles-linea");
 
        const btnMenos = document.createElement("button");
        btnMenos.classList.add("boton-mini");
        btnMenos.textContent = "−";
        btnMenos.addEventListener("click", () => {
            cambiarCantidad(item.id, -1);
        });
 
        const btnMas = document.createElement("button");
        btnMas.classList.add("boton-mini");
        btnMas.textContent = "+";
        btnMas.addEventListener("click", () => {
            cambiarCantidad(item.id, 1);
        });
 
        const btnQuitar = document.createElement("button");
        btnQuitar.classList.add("boton-mini");
        btnQuitar.classList.add("boton-quitar");
        btnQuitar.textContent = "X";
        btnQuitar.addEventListener("click", () => {
            quitarDelCarrito(item.id);
        });
 
        controles.appendChild(btnMenos);
        controles.appendChild(btnMas);
        controles.appendChild(btnQuitar);
 
        linea.appendChild(info);
        linea.appendChild(controles);
        contenedorCarrito.appendChild(linea);
    });
};
 
// ---> Escribe los totales en el panel derecho
function renderizarResumen() {
    const totales = calcularTotales();
 
    textoSubtotal.textContent = formatearPrecio(totales.subtotal);
    textoTotal.textContent = formatearPrecio(totales.total);
    contadorCarrito.textContent = contarUnidades();
 
    // Operador ternario para el texto del envío
    textoEnvio.textContent = (totales.envio === 0) ? "Gratis" : formatearPrecio(totales.envio);
}
 
// ---> Función maestra: refresca las tres zonas de la interfaz
function actualizarPantalla() {
    renderizarProductos();
    renderizarCarrito();
    renderizarResumen();
}
 
 
 
/* =========================================================================
   7. MENSAJES DEL SISTEMA
   ========================================================================= */
function mostrarMensaje(texto, tipo) {
    mensajeSistema.textContent = texto;
 
    mensajeSistema.classList.remove("oculto");
    mensajeSistema.classList.remove("mensaje-exito");
    mensajeSistema.classList.remove("mensaje-error");
 
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
 
    clearTimeout(temporizadorMensaje);
 
    temporizadorMensaje = setTimeout(() => {
        mensajeSistema.classList.add("oculto");
    }, 3000);
}
 
 
/* =========================================================================
   8. INICIALIZACIÓN (Función autoejecutable - IIFE)
   ========================================================================= */
(function iniciarTienda() {
    console.log("Iniciando la tienda...");
    actualizarPantalla();
    console.log(`Tienda lista con ${inventarioProductos.length} productos.`);
})();
