/* =========================================================================
   TIENDA DE PRODUCTOS - VERSIÓN 3: FILTROS, CUPONES, COMPRA Y MODO OSCURO
   ========================================================================= */


/* =========================================================================
   1. VARIABLES Y TIPOS DE DATOS (nuestra "base de datos" simulada)
   ========================================================================= */
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

// Valores fijos representados como constantes en MAYÚSCULAS (reglas de negocio)
const COSTO_ENVIO = 8;
const MINIMO_ENVIO_GRATIS = 60;
const MINIMO_CUPON_MITAD = 100;

// Variables "let" que cambian: representan el estado de la aplicación
let carrito = [];               // Array de objetos {id, nombre, precio, icono, cantidad}
let porcentajeDescuento = 0;    // 0, 0.10 o 0.50
let envioGratisPorCupon = false;
let categoriaActual = "todos";  // Filtro del catálogo
let temaOscuro = false;
let numeroPedido = 1000;
let temporizadorMensaje = null; // Guarda el setTimeout activo del mensaje


/* =========================================================================
   2. SELECCIÓN DE ELEMENTOS DEL DOM
   ========================================================================= */
const contenedorProductos = document.getElementById("lista-productos");
const contenedorCarrito   = document.getElementById("items-carrito");
const contadorCarrito     = document.getElementById("contador-carrito");
const textoSubtotal = document.getElementById("texto-subtotal");
const textoEnvio    = document.getElementById("texto-envio");
const textoTotal    = document.getElementById("texto-total");
const mensajeSistema = document.getElementById("mensaje-sistema");
const textoDescuento = document.getElementById("texto-descuento");
const lineaDescuento = document.getElementById("linea-descuento");
const inputDescuento  = document.getElementById("input-descuento");
const btnDescuento    = document.getElementById("btn-aplicar-descuento");
const selectCategoria = document.getElementById("filtro-categoria");
const formCompra  = document.getElementById("form-compra");
const inputNombre = document.getElementById("input-nombre");
const inputCorreo = document.getElementById("input-correo");
const panelBoleta    = document.getElementById("panel-boleta");
const avisoConexion  = document.getElementById("aviso-conexion");
const btnTema        = document.getElementById("btn-tema");


/* =========================================================================
   3. FUNCIONES AUXILIARES
   ========================================================================= */

// Función flecha: convierte un número en texto de precio (2 decimales)
const formatearPrecio = (valor) => {
    return `$${valor.toFixed(2)}`;
};

// Función declarativa: busca un producto por su id
function buscarProductoPorId(idProducto) {
    for (let i = 0; i < inventarioProductos.length; i++) {
        if (inventarioProductos[i].id === idProducto) {
            return inventarioProductos[i];
        }
    }
    return null;
}

// Busca una línea dentro del carrito
function buscarItemEnCarrito(idProducto) {
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id === idProducto) {
            return carrito[i];
        }
    }
    return null;
}

// Devuelve un carrito NUEVO sin el producto indicado
const carritoSinProducto = (idProducto) => {
    const nuevoCarrito = [];
    carrito.forEach((item) => {
        if (item.id !== idProducto) {
            nuevoCarrito.push(item);
        }
    });
    return nuevoCarrito;
};

// Cuenta cuántas unidades hay en total en el carrito
const contarUnidades = () => {
    let unidades = 0;
    carrito.forEach((item) => {
        unidades = unidades + item.cantidad;
    });
    return unidades;
};

// 3.6. Función flecha: calcula subtotal, descuento, envío y total.
const calcularTotales = () => {
    let subtotal = 0;

    carrito.forEach((item) => {
        subtotal = subtotal + (item.precio * item.cantidad);
    });

    const descuento = subtotal * porcentajeDescuento;

    // El envío es gratis si el carrito está vacío, si se aplicó cupón de envío
    // gratis, o si el subtotal menos el descuento supera el mínimo.
    const envio = (carrito.length === 0 || envioGratisPorCupon === true || subtotal - descuento >= MINIMO_ENVIO_GRATIS) ? 0 : COSTO_ENVIO;

    const total = subtotal - descuento + envio;

    return {
        subtotal: subtotal,
        descuento: descuento,
        envio: envio,
        total: total
    };
};


/* =========================================================================
   4. DIBUJAR EL CATÁLOGO
   ========================================================================= */
function renderizarProductos() {

    // Limpiamos el contenedor antes de volver a dibujarlo
    while (contenedorProductos.firstChild) {
        contenedorProductos.removeChild(contenedorProductos.firstChild);
    }

    inventarioProductos.forEach((producto) => {
        const coincideFiltro = (categoriaActual === "todos" || producto.categoria === categoriaActual);
        if (coincideFiltro) {
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta");

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

            const itemEnCarrito = buscarItemEnCarrito(producto.id);
            const textoEnCarrito = (itemEnCarrito === null) ? "" : `Ya llevas ${itemEnCarrito.cantidad} en el carrito`;

            tarjeta.innerHTML =
            `
                <span class="icono-producto"><img src="${producto.icono}" alt="${producto.nombre}" style="width: 100%; height: auto;"></span>
                <h3 class="nombre-producto">${producto.nombre}</h3>
                                <p class="etiqueta-categoria etiqueta-${producto.categoria}">${producto.categoria}</p>
                <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
                <p class="estado-stock">${textoStock}</p>
                <p class="mini-dato">${textoEnCarrito}</p>
            `;

            const botonComprar = document.createElement("button");
            botonComprar.classList.add("boton", "boton-bloque");

            if (producto.stock === 0) {
                botonComprar.textContent = "Sin existencias";
                botonComprar.disabled = true;
            } else {
                botonComprar.textContent = "Agregar al carrito";
                botonComprar.addEventListener("click", () => {
                    agregarAlCarrito(producto.id);
                });
            }

            const botonDetalles = document.createElement("button");
            botonDetalles.classList.add("boton", "boton-secundario", "boton-bloque");
            botonDetalles.textContent = "Ver detalles";
            botonDetalles.addEventListener("click", () => {
                mostrarDetalles(producto.id);
            });

            tarjeta.appendChild(botonComprar);
            tarjeta.appendChild(botonDetalles);
            contenedorProductos.appendChild(tarjeta);
        }
    });
}

function mostrarDetalles(idProducto) {
    const producto = buscarProductoPorId(idProducto);
    const contenidoModal = document.getElementById("contenido-modal");

    contenidoModal.innerHTML = `
        <h3>${producto.nombre}</h3>
        <p class="etiqueta-categoria">${producto.categoria}</p>
        <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
        <p class="estado-stock">Stock disponible: ${producto.stock}</p>
    `;

    document.getElementById("modal-detalle").classList.remove("oculto");
}


/* =========================================================================
   5. LÓGICA DE COMPRA Y CARRITO
   ========================================================================= */

const agregarAlCarrito = (idProducto) => {
    const producto = buscarProductoPorId(idProducto);

    if (producto.stock > 0) {
        const item = buscarItemEnCarrito(idProducto);

        if (item === null) {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                icono: producto.icono,
                cantidad: 1
            });
        } else {
            item.cantidad++;
        }

        producto.stock--;
        mostrarMensaje(`${producto.nombre} agregado al carrito`, "exito");
        actualizarPantalla();

        // Animación: destello en la tarjeta y rebote en el contador
        const tarjetas = document.querySelectorAll(".tarjeta");
        tarjetas.forEach((tarjeta) => {
            if (tarjeta.querySelector(".nombre-producto").textContent === producto.nombre) {
                tarjeta.classList.add("agregado");
                setTimeout(() => tarjeta.classList.remove("agregado"), 500);
            }
        });

        contadorCarrito.classList.add("rebotando");
        setTimeout(() => contadorCarrito.classList.remove("rebotando"), 350);
    } else {
        mostrarMensaje(`No queda inventario de ${producto.nombre}`, "error");
    }
};

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
        producto.stock++;

        if (item.cantidad === 0) {
            carrito = carritoSinProducto(idProducto);
        }
    }

    actualizarPantalla();
}

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

const renderizarCarrito = function () {
    while (contenedorCarrito.firstChild) {
        contenedorCarrito.removeChild(contenedorCarrito.firstChild);
    }

    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.classList.add("carrito-vacio");
        vacio.textContent = "Tu carrito está vacío. Agrega productos del catálogo.";
        contenedorCarrito.appendChild(vacio);
        return;
    }

    carrito.forEach((item) => {
        const linea = document.createElement("div");
        linea.classList.add("linea-carrito");

        const info = document.createElement("div");
        info.innerHTML = `
            <p class="nombre-linea">${item.nombre}</p>
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
        btnQuitar.classList.add("boton-mini", "boton-quitar");
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

// 3.7. Escribe los totales en el panel derecho.
function renderizarResumen() {
    const totales = calcularTotales();

    textoSubtotal.textContent = formatearPrecio(totales.subtotal);
    textoTotal.textContent = formatearPrecio(totales.total);
    contadorCarrito.textContent = contarUnidades();

    if (totales.descuento > 0) {
        textoDescuento.textContent = `- ${formatearPrecio(totales.descuento)}`;
        lineaDescuento.classList.remove("oculto");
    } else {
        lineaDescuento.classList.add("oculto");
    }

    textoEnvio.textContent = (totales.envio === 0) ? "Gratis" : formatearPrecio(totales.envio);
}

// Función maestra: refresca las tres zonas de la interfaz
function actualizarPantalla() {
    renderizarProductos();
    renderizarCarrito();
    renderizarResumen();
}


/* =========================================================================
   7. FILTRO POR CATEGORÍA
   ========================================================================= */
// Recorre el inventario y crea una <option> por cada categoría distinta
function generarOpcionesCategoria() {
    const categoriasAgregadas = [];

    inventarioProductos.forEach((producto) => {
        if (!categoriasAgregadas.includes(producto.categoria)) {
            categoriasAgregadas.push(producto.categoria);

            const opcion = document.createElement("option");
            opcion.value = producto.categoria;
            opcion.textContent = producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1) + "s";
            selectCategoria.appendChild(opcion);
        }
    });
}

   selectCategoria.addEventListener("change", () => {
    categoriaActual = selectCategoria.value;
    renderizarProductos();
});


/* =========================================================================
   8. CUPONES DE DESCUENTO
   ========================================================================= */
const aplicarCupon = function () {
    const codigo = inputDescuento.value;
    const totales = calcularTotales();

    if (carrito.length === 0) {
        mostrarMensaje("Agrega productos antes de usar un cupón", "info");
        return;
    }

    switch (codigo) {
        case "DESCUENTO10":
            porcentajeDescuento = 0.10;
            envioGratisPorCupon = false;
            mostrarMensaje("Cupón aplicado: 10% de descuento", "exito");
            break;

        case "MITAD":
            if (totales.subtotal >= MINIMO_CUPON_MITAD) {
                porcentajeDescuento = 0.50;
                envioGratisPorCupon = false;
                mostrarMensaje("Cupón aplicado: 50% de descuento", "exito");
            } else {
                porcentajeDescuento = 0;
                mostrarMensaje(
                    `El cupón MITAD necesita una compra mínima de ${formatearPrecio(MINIMO_CUPON_MITAD)}`,
                    "error"
                );
            }
            break;

        case "ENVIOGRATIS":
            porcentajeDescuento = 0;
            envioGratisPorCupon = true;
            mostrarMensaje("Cupón aplicado: envío gratis", "exito");
            break;

        default:
            porcentajeDescuento = 0;
            envioGratisPorCupon = false;
            mostrarMensaje("Ese código no existe o ya venció", "error");
    }
    renderizarResumen();
};

btnDescuento.addEventListener("click", () => {
    aplicarCupon();
});

function detectarEnterCupon(e) {
    if (e.key === "Enter") {
        aplicarCupon();
    }
}
inputDescuento.addEventListener("keydown", detectarEnterCupon);


/* =========================================================================
   9. FORMULARIO DE COMPRA Y COMPROBANTE
   ========================================================================= */
const manejarCompra = function (evento) {
    evento.preventDefault();

    if (carrito.length === 0) {
        mostrarMensaje("Tu carrito está vacío", "error");
        return;
    }

    const nombreCliente = inputNombre.value;
    const correoCliente = inputCorreo.value;

    if (nombreCliente.length < 3) {
        mostrarMensaje("Escribe tu nombre completo (mínimo 3 letras)", "error");
        return;
    }

    const totales = calcularTotales();
    numeroPedido++;

    dibujarBoleta(nombreCliente, correoCliente, totales);

    carrito = [];
    porcentajeDescuento = 0;
    envioGratisPorCupon = false;
    inputDescuento.value = "";
    inputNombre.value = "";
    inputCorreo.value = "";

    mostrarMensaje(`Pedido #${numeroPedido} confirmado`, "exito");
    actualizarPantalla();
};
formCompra.addEventListener("submit", manejarCompra);

function dibujarBoleta(nombreCliente, correoCliente, totales) {
    while (panelBoleta.firstChild) {
        panelBoleta.firstChild.remove();
    }

    const titulo = document.createElement("h3");
    titulo.textContent = `Pedido #${numeroPedido} confirmado`;
    panelBoleta.appendChild(titulo);

    const datos = document.createElement("p");
    datos.textContent = `${nombreCliente} · ${correoCliente}`;
    panelBoleta.appendChild(datos);

    let i = 0;
    do {
        const item = carrito[i];
        const linea = document.createElement("p");
        linea.textContent = `${item.cantidad} x ${item.nombre} = ${formatearPrecio(item.precio * item.cantidad)}`;
        panelBoleta.appendChild(linea);
        i++;
    } while (i < carrito.length);

    if (totales.descuento > 0) {
        const ahorro = document.createElement("p");
        ahorro.textContent = `Ahorraste ${formatearPrecio(totales.descuento)} con tu cupón`;
        panelBoleta.appendChild(ahorro);
    }

    const envio = document.createElement("p");
    envio.textContent = (totales.envio === 0)
        ? "Envío: gratis"
        : `Envío: ${formatearPrecio(totales.envio)}`;
    panelBoleta.appendChild(envio);

    const total = document.createElement("p");
    total.classList.add("boleta-total");
    total.textContent = `Total pagado: ${formatearPrecio(totales.total)}`;
    panelBoleta.appendChild(total);

    panelBoleta.classList.remove("oculto");
}


/* =========================================================================
   10. MODO OSCURO
   ========================================================================= */
btnTema.addEventListener("click", () => {
    if (temaOscuro === false) {
        document.body.classList.add("tema-oscuro");
        btnTema.textContent = "Modo claro";
        temaOscuro = true;
    } else {
        document.body.classList.remove("tema-oscuro");
        btnTema.textContent = "Modo oscuro";
        temaOscuro = false;
    }
});


/* =========================================================================
   11. MENSAJES DEL SISTEMA
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
   12. INICIALIZACIÓN (Función autoejecutable - IIFE)
   ========================================================================= */
(function iniciarTienda() {
    console.log("Iniciando la tienda...");
    
    generarOpcionesCategoria();
    actualizarPantalla();

    window.addEventListener("offline", () => {
        avisoConexion.classList.remove("oculto");
    });

    window.addEventListener("online", () => {
        avisoConexion.classList.add("oculto");
        mostrarMensaje("Conexión restaurada", "exito");
    });

    console.log(`Tienda lista con ${inventarioProductos.length} productos.`);
        document.getElementById("cerrar-modal").addEventListener("click", () => {
        document.getElementById("modal-detalle").classList.add("oculto");
    });

    document.getElementById("modal-detalle").addEventListener("click", (evento) => {
        if (evento.target.id === "modal-detalle") {
            document.getElementById("modal-detalle").classList.add("oculto");
        }
    });
})();