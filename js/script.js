// Recuperar carrito del LocalStorage o iniciar vacío
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Elementos del DOM
const listaProductos = document.getElementById("lista-productos");
const carritoLista = document.getElementById("carrito-lista");
const totalCarrito = document.getElementById("total");
const btnVaciar = document.getElementById("vaciar-carrito");
const btnFinalizar = document.getElementById("finalizar-compra");

// Cargar productos desde JSON
let productos = [];

fetch("./data/productos.json")
  .then(response => response.json())
  .then(data => {
    productos = data;
    mostrarProductos();
  })
  .catch(error => console.error("Error al cargar productos:", error));

// Mostrar productos
function mostrarProductos() {
  listaProductos.innerHTML = "";
  productos.forEach((producto, index) => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <span>${producto.nombre} - $${producto.precio} (Stock: ${producto.stock})</span>
      <input type="number" min="1" value="1" id="cantidad-${index}" style="width:50px;">
      <button onclick="agregarAlCarrito(${index})">Agregar</button>
    `;
    listaProductos.appendChild(div);
  });
}

// Agregar producto al carrito
function agregarAlCarrito(index) {
  const cantidad = parseInt(document.getElementById(`cantidad-${index}`).value);
  if (isNaN(cantidad) || cantidad <= 0) {
    Swal.fire("Cantidad inválida", "Debes ingresar un número válido", "warning");
    return;
  }

  const producto = productos[index];

  if (cantidad > producto.stock) {
    Swal.fire("Sin stock suficiente", `Solo quedan ${producto.stock} unidades de ${producto.nombre}`, "error");
    return;
  }

  const existente = carrito.find(item => item.nombre === producto.nombre);

  if (existente) {
    if (existente.cantidad + cantidad > producto.stock) {
      Swal.fire("Stock insuficiente", `No puedes agregar más de ${producto.stock} unidades`, "error");
      return;
    }
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  guardarCarrito();
  mostrarCarrito();
  Swal.fire("Producto agregado", `${cantidad} kg de ${producto.nombre} agregado al carrito.`, "success");
}

// Mostrar carrito
function mostrarCarrito() {
  carritoLista.innerHTML = "";
  let total = 0;

  carrito.forEach((item, idx) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.cantidad} kg de ${item.nombre} - $${subtotal}
      <button onclick="eliminarDelCarrito(${idx})">❌</button>
    `;
    carritoLista.appendChild(li);
  });

  totalCarrito.textContent = `Total: $${total}`;
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  mostrarCarrito();
}

// Guardar carrito en LocalStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Vaciar carrito
btnVaciar.addEventListener("click", () => {
  carrito = [];
  guardarCarrito();
  mostrarCarrito();
  Swal.fire("Carrito vacío", "Se eliminaron todos los productos", "info");
});

// Finalizar compra
function finalizarCompra() {
  if (carrito.length === 0) {
    Swal.fire("Carrito vacío", "Agrega productos antes de comprar", "warning");
    return;
  }

  Swal.fire({
    title: "Finalizar compra",
    html: `
      <input type="text" id="nombre" class="swal2-input" placeholder="Nombre completo">
      <input type="email" id="email" class="swal2-input" placeholder="Email">
      <input type="text" id="direccion" class="swal2-input" placeholder="Dirección">
    `,
    confirmButtonText: "Confirmar compra",
    focusConfirm: false,
    preConfirm: () => {
      const nombre = Swal.getPopup().querySelector("#nombre").value;
      const email = Swal.getPopup().querySelector("#email").value;
      const direccion = Swal.getPopup().querySelector("#direccion").value;
      if (!nombre || !email || !direccion) {
        Swal.showValidationMessage(`Por favor completa todos los campos`);
      }
      return { nombre, email, direccion };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarrito();
      mostrarCarrito();
      Swal.fire("¡Compra realizada!", "Te enviaremos un mail con el detalle.", "success");
    }
  });
}

btnFinalizar.addEventListener("click", finalizarCompra);

// Inicializar carrito en pantalla
mostrarCarrito();