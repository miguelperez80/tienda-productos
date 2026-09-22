
 
// Valores fijos representados como constantes en MAYÚSCULAS aplicables para las reglas de negocio de la tienda
const COSTO_ENVIO = 8;
const MINIMO_ENVIO_GRATIS = 60;
const MINIMO_CUPON_MITAD = 100;
 
// Definición de variables "let" que pueden cambiar su contenido. Representan el estado de la aplicación.
let carrito = [];               // Array de objetos que se van a comprar {id, nombre, precio, icono, cantidad}
let porcentajeDescuento = 0;    // Numero para los descuentos disponibles: 0, 0.10 o 0.50
let envioGratisPorCupon = false;// Boolean para la selección de envío gratis o no
let categoriaActual = "todos";  // String: filtro para desplegar todo el catálogo o solo una categoría
let temaOscuro = false;         // Boolean: controla la clase del <body>
let numeroPedido = 1000;        // Number: contador de pedidos confirmados
let temporizadorMensaje = null; // Guarda el setTimeout activo del mensaje
 
 

 
/* =========================================================================
   2. SELECCIÓN DE ELEMENTOS DEL DOM (Elementos que se van a actualizar dinámicamente)
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
 
 

 
// 3.6. Función flecha: calcula subtotal, descuento, envío y total.
// Esta función devuelve un objeto con cuatro propiedades: subtotal, descuento, envio y total.
const calcularTotales = () => {
    let subtotal = 0;
 
    // forEach: recorre el carrito ejecutando una acción por cada elemento
    carrito.forEach((item) => {
        subtotal = subtotal + (item.precio * item.cantidad);
    });
 
    const descuento = subtotal * porcentajeDescuento;
 
    // Condicional múltiple: el envío depende de tres reglas distintas
    
    // El envío es gratis si el carrito está vacío, si se aplicó un cupón de envío gratis, o si el subtotal menos el descuento supera el mínimo para envío gratis.
    const envio = (carrito.length === 0 || envioGratisPorCupon === true || subtotal - descuento >= MINIMO_ENVIO_GRATIS) ? 0 : COSTO_ENVIO;
 
    const total = subtotal - descuento + envio;
 
    return {
        subtotal: subtotal,
        descuento: descuento,
        envio: envio,
        total: total
    };
};

 
// 3.7. Función declarativa: escribe los totales en el panel derecho.
//Esta función se llama cada vez que se actualiza el carrito o se aplica un cupón. Actualiza el subtotal, el descuento, el costo del envío y el total a pagar en la interfaz de usuario. También actualiza el contador de unidades en el carrito. Si hay un descuento aplicado, muestra la línea de descuento; si no, la oculta.
// El costo del envío se muestra como "Gratis" si es cero, o con el precio correspondiente si no lo es.
function renderizarResumen() {
    const totales = calcularTotales();
 
    textoSubtotal.textContent = formatearPrecio(totales.subtotal);
    textoTotal.textContent = formatearPrecio(totales.total);
    contadorCarrito.textContent = contarUnidades();
 
    // Condicional doble: la línea de descuento solo aparece si hay descuento
    if (totales.descuento > 0) {
        textoDescuento.textContent = `- ${formatearPrecio(totales.descuento)}`;
        lineaDescuento.classList.remove("oculto");
    } else {
        lineaDescuento.classList.add("oculto");
    }
 
    // Operador ternario para el texto del envío
    textoEnvio.textContent = (totales.envio === 0) ? "Gratis" : formatearPrecio(totales.envio);
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
 
            // Plantillas literales para armar el HTML interno de la tarjeta
            tarjeta.innerHTML = 
            `
                <span class="icono-producto"><img src="${producto.icono}" alt="${producto.nombre}" style="width: 100%; height: auto;"></span>
                <h3 class="nombre-producto">${producto.nombre}</h3>
                <p class="etiqueta-categoria">${producto.categoria}</p>
                <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
                <p class="estado-stock">${textoStock}</p>
                <p class="mini-dato">${textoEnCarrito}</p>
            `;
 
            // El botón se crea aparte para poder escucharlo con addEventListener
            const botonComprar = document.createElement("button");
            botonComprar.classList.add("boton", "boton-bloque");
 
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
    });
 

 
// 8.5. Cambio de categoría (evento change de un selector) que permite filtrar los productos por categoría.
    // Actualiza la variable global 'categoriaActual' y vuelve a dibujar el catálogo.
    selectCategoria.addEventListener("change", () => {
        categoriaActual = selectCategoria.value; // .value trae la opción elegida
        renderizarProductos();
    });
 

 
// 8.2. Cupones: función expresiva reutilizada por el clic y por Enter que permite aplicar un cupón de descuento o envío gratis.
    // Actualiza el resumen y muestra un mensaje según el resultado.
    const aplicarCupon = function () {
        const codigo = inputDescuento.value;
        const totales = calcularTotales();
 
        if (carrito.length === 0) {
            mostrarMensaje("Agrega productos antes de usar un cupón", "info");
            return;
        }
 
        // SWITCH: comparamos el texto exacto que escribió el usuario
        switch (codigo) {
            case "DESCUENTO10":
                porcentajeDescuento = 0.10;
                envioGratisPorCupon = false;
                mostrarMensaje("Cupón aplicado: 10% de descuento", "exito");
                break;
 
            case "MITAD":
                // Condicional anidado: este cupón exige una compra mínima
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
                // Cualquier otro texto cae aquí y se reinician los beneficios
                porcentajeDescuento = 0;
                envioGratisPorCupon = false;
                mostrarMensaje("Ese código no existe o ya venció", "error");
        }
        renderizarResumen();
    };
 
// 8.3. Evento de ratón + función flecha que permite aplicar el cupón al hacer clic en el botón correspondiente.
    btnDescuento.addEventListener("click", () => {
        aplicarCupon();
    });
 
    // 8.4. Evento de teclado + función declarativa que permite aplicar el cupón al presionar la tecla Enter en el campo de texto.
    // Función declarativa que recibe el Objeto Evento (e)
    function detectarEnterCupon(e) {
        if (e.key === "Enter") {
            aplicarCupon();
        }
    }
    inputDescuento.addEventListener("keydown", detectarEnterCupon);

 
// 8.7. Formulario de compra: función expresiva que permite confirmar la compra y generar la boleta.
    // Valida que el carrito no esté vacío y que el nombre tenga al menos 3 letras.
    // Reinicia el estado de la compra después de confirmar.
    const manejarCompra = function (evento) {
        // preventDefault() cancela la recarga automática de la página
        evento.preventDefault();
 
        if (carrito.length === 0) {
            mostrarMensaje("Tu carrito está vacío", "error");
            return;
        }
 
        const nombreCliente = inputNombre.value;
        const correoCliente = inputCorreo.value;
 
        // Validación propia además de la que ya hace el HTML con 'required'
        if (nombreCliente.length < 3) {
            mostrarMensaje("Escribe tu nombre completo (mínimo 3 letras)", "error");
            return;
        }
 
        const totales = calcularTotales();
        numeroPedido++;
 
        dibujarBoleta(nombreCliente, correoCliente, totales);
 
        // Reiniciamos el estado de la compra (el stock vendido NO se devuelve)
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
 

 
// 8.8. Función declarativa que permite dibujar la boleta de compra en el panel derecho. Muestra el número de pedido,
    // el nombre y correo del cliente, los productos comprados, el ahorro por cupón (si lo hubo), el costo del envío y el
    // total pagado.
    function dibujarBoleta(nombreCliente, correoCliente, totales) {
 
        // Limpiamos la boleta anterior
        while (panelBoleta.firstChild) {
            //panelBoleta.removeChild(panelBoleta.firstChild);
            panelBoleta.firstChild.remove();
        }
 
        const titulo = document.createElement("h3");
        titulo.textContent = `Pedido #${numeroPedido} confirmado`;
        panelBoleta.appendChild(titulo);
 
        const datos = document.createElement("p");
        datos.textContent = `${nombreCliente} · ${correoCliente}`;
        panelBoleta.appendChild(datos);
 
        // Ciclo DO-WHILE: se ejecuta al menos una vez y aquí eso es correcto,
        // porque solo llegamos a esta función cuando el carrito tiene productos.
        let i = 0;
        do {
            const item = carrito[i];
            const linea = document.createElement("p");
            linea.textContent = `${item.cantidad} x ${item.nombre} = ${formatearPrecio(item.precio * item.cantidad)}`;
            panelBoleta.appendChild(linea);
            i++;
        } while (i < carrito.length);
 
        // Condicional simple: la línea de ahorro solo aparece si hubo descuento
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
 
 

 
// 8.6. Cambio de tema a tema oscuro o claro (evento click de un botón) que permite alternar entre los dos estilos.
    // Actualiza la variable global 'temaOscuro' y cambia la clase del <body>.
    btnTema.addEventListener("click", () => {
        // Condicional doble sobre un Boolean
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
 
 

 
//8.9. Función autoejecutable: se ejecuta automáticamente al cargar la página. Inicializa la tienda y actualiza la pantalla.
    (function iniciarTienda() {
        console.log("Iniciando la tienda...");
 
        // Primer dibujado de la interfaz
        actualizarPantalla();
 
        // Eventos del navegador: avisar cuando se cae o vuelve la conexión
        window.addEventListener("offline", () => {
            avisoConexion.classList.remove("oculto");
        });
 
        window.addEventListener("online", () => {
            avisoConexion.classList.add("oculto");
            mostrarMensaje("Conexión restaurada", "exito");
        });
 
        console.log(`Tienda lista con ${inventarioProductos.length} productos.`);
    })();
