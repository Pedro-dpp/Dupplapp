let cartas = []; // Variable global para almacenar las cartas
let habilidadesData = []; // aquí guardamos el JSON

// funcion para determinar el estamento de una carta
const determinarEstamento = function (estamento) {
  switch (estamento) {
    case 1:
      return "Bajo.";
    case 2:
      return "Medio.";
    case 3:
      return "Alto.";
    case 4:
      return "Neutro.";
    case 5:
      return "No tiene un estamento definido.";
  }
};

// funcion para determinar el tipo de una carta
const determinarTipo = function (tipo) {
  switch (tipo) {
    case 1:
      return "Zona";
    case 2:
      return "Invocacion";
    case 3:
      return "Evento";
    case 4:
      return "Reliquia";
    case 5:
      return "No tiene un estamento definido";
  }
};

const obtenerDescripcionHabilidad = function (idHabilidad) {
  const habilidad = habilidadesData.find((h) => h.id === idHabilidad);
  return habilidad ? habilidad.descripcion : "HABILIDAD DESCONOCIDA";
};

const formatearHabilidades = function (habilidades) {
  if (!habilidades || habilidades.length === 0) return "Ninguna";
  return habilidades.map(obtenerDescripcionHabilidad).join(" ");
};

// Función para cargar y mostrar las cartas
async function cargarCartas() {
  try {
    // Cargar habilidades
    const habRes = await fetch("../json/habilidades.json");
    if (!habRes.ok) throw new Error("Error al cargar habilidades.json");
    habilidadesData = await habRes.json();

    // Cargar cartas
    const response = await fetch("../json/cartas.json");
    if (!response.ok) throw new Error("Error al cargar cartas.json");
    cartas = await response.json();

    mostrarCartas(cartas);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

// Función para mostrar las cartas en el contenedor
function mostrarCartas(cartasMostrar) {
  const cartasContainer = document.getElementById("cartas-container");
  const rutaBase = "../cartas/"; // Ruta base de las imágenes

  // Limpiar el contenedor de cartas
  cartasContainer.innerHTML = "";

  // Generar las tarjetas de las cartas
  cartasMostrar.forEach((carta) => {
    // Determinamos el estamento de la carta
    const estamento = determinarEstamento(carta.estamento);
    // Formatear las habilidades de la carta
    const habilidades = formatearHabilidades(carta.habilidades);
    const tipo = determinarTipo(carta.tipo_carta);
    // Creamos la carta
    const cartaHTML = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${rutaBase}${
      carta.id_carta
    }.jpg" class="card-img-top" alt="${carta.nombre}" />
            <div class="card-body">
              <h5 class="card-title">${carta.nombre}
              <button
                class="btn btn-primary float-end"
                data-bs-toggle="modal"
                data-bs-target="#modalCarta${carta.id_carta}"
              >
                Ver Detalles
              </button></h5>
              
            </div>
          </div>
        </div>

        <!-- Modal para Detalles de Carta ${carta.id_carta} -->
        <div
          class="modal fade"
          id="modalCarta${carta.id_carta}"
          tabindex="-1"
          aria-labelledby="modalCarta${carta.id_carta}Label"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modalCarta${carta.id_carta}Label">${
      carta.nombre
    } [${tipo}]</h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <p><strong>Coste en Monedas:</strong> ${carta.coste_monedas}</p>
                <p><strong>Estamento:</strong> ${estamento}</p>
                <p><strong>Texto:</strong> ${carta.descripcion}</p>
                <p><strong>Descripción de Habilidades:</strong> ${habilidades}</p>
                <!--
                <p><strong>Vida:</strong> ${carta.vida}</p>
                <p><strong>Fuerza:</strong> ${carta.fuerza}</p>
                <p><strong>Habilidades:</strong> ${
                  carta.habilidades.join(", ") || "Ninguna"
                }</p>-->
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

    cartasContainer.innerHTML += cartaHTML; // Agregar la carta al contenedor
  });
}
// Función para aplicar todos los filtros
function aplicarFiltros() {
  const nombreBusqueda = document
    .getElementById("buscadorNombre")
    .value.toLowerCase();
  const descripcionBusqueda = document
    .getElementById("buscadorDescripcion")
    .value.toLowerCase();
  const tipoSeleccionado = document.getElementById("filtroTipo").value;
  const estamentoSeleccionado =
    document.getElementById("filtroEstamento").value;
  const costeSeleccionado = document.getElementById("filtroCoste").value;

  let cartasFiltradas = cartas;

  // Filtrar por nombre
  if (nombreBusqueda) {
    cartasFiltradas = cartasFiltradas.filter((carta) =>
      carta.nombre.toLowerCase().includes(nombreBusqueda)
    );
  }

  // Filtrar por descripción
  if (descripcionBusqueda) {
    cartasFiltradas = cartasFiltradas.filter((carta) =>
      carta.descripcion.toLowerCase().includes(descripcionBusqueda)
    );
  }

  // Filtrar por tipo
  if (tipoSeleccionado) {
    cartasFiltradas = cartasFiltradas.filter(
      (carta) => carta.tipo_carta == tipoSeleccionado
    );
  }

  // Filtrar por estamento
  if (estamentoSeleccionado) {
    cartasFiltradas = cartasFiltradas.filter(
      (carta) => carta.estamento == estamentoSeleccionado
    );
  }

  // Filtrar por coste
  if (costeSeleccionado) {
    if (costeSeleccionado == 6) {
      // Mostrar cartas con coste 6 o más
      cartasFiltradas = cartasFiltradas.filter(
        (carta) => carta.coste_monedas >= 6
      );
    } else {
      // Mostrar cartas con el coste exacto
      cartasFiltradas = cartasFiltradas.filter(
        (carta) => carta.coste_monedas == costeSeleccionado
      );
    }
  }

  // Mostrar las cartas filtradas
  mostrarCartas(cartasFiltradas);
}

// Eventos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarCartas(); // Cargar las cartas al inicio

  const btnBuscar = document.getElementById("btnBuscar");
  const buscadorNombre = document.getElementById("buscadorNombre");
  const buscadorDescripcion = document.getElementById("buscadorDescripcion");
  const filtroTipo = document.getElementById("filtroTipo");
  const filtroEstamento = document.getElementById("filtroEstamento");
  const filtroCoste = document.getElementById("filtroCoste");

  // Evento para el botón de búsqueda
  btnBuscar.addEventListener("click", aplicarFiltros);

  // Evento para los campos de búsqueda (al presionar "Enter")
  buscadorNombre.addEventListener("keypress", (e) => {
    if (e.key === "Enter") aplicarFiltros();
  });
  buscadorDescripcion.addEventListener("keypress", (e) => {
    if (e.key === "Enter") aplicarFiltros();
  });

  // Eventos para los filtros
  filtroTipo.addEventListener("change", aplicarFiltros);
  filtroEstamento.addEventListener("change", aplicarFiltros);
  filtroCoste.addEventListener("change", aplicarFiltros);
});
