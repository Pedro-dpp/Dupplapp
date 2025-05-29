// cargamos los datos desde json
let barajas = [];
let cartas = [];
let barajaActual = null;

async function cargarDatos() {
  try {
    const [responseBarajas, responseCartas] = await Promise.all([
      fetch("../json/barajas.json"),
      fetch("../json/cartas.json"),
    ]);

    if (!responseBarajas.ok || !responseCartas.ok) {
      throw new Error("Error al cargar los datos");
    }

    barajas = await responseBarajas.json();
    cartas = await responseCartas.json();
    mostrarBarajas();
  } catch (error) {
    console.error("Error:", error);
  }
}

function mostrarBarajas() {
  const container = document.getElementById("barajas-container");
  container.innerHTML = barajas
    .map(
      (baraja) => `
    <div class="col-md-4 mb-4">
      <div class="card h-100 baraja-card" onclick="mostrarDetalleBaraja('${baraja.id_baraja}')" style="cursor: pointer;">
        <img src="../barajas/${baraja.id_baraja}.jpg" class="card-img-top" alt="${baraja.nombre_baraja}">
        <div class="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title mb-0">${baraja.nombre_baraja}</h5>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-secondary" 
              onclick="event.stopPropagation(); simularManoInicial('${baraja.id_baraja}')">
              <i class="fas fa-random"></i>
              <strong>
              <span class="d-none d-md-inline ms-1">Test</span></strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function mostrarDetalleBaraja(idBaraja) {
  barajaActual = barajas.find((b) => b.id_baraja === idBaraja);
  const detalleContainer = document.getElementById("baraja-detalle-container");

  detalleContainer.style.display = "block";

  // Obtener la pestaña activa
  const tabActiva = document.querySelector("#barajaTabs .nav-link.active").id;

  // Actualizar el contenido según la pestaña activa de la baraja
  if (tabActiva === "cartas-tab") {
    mostrarCartasEnDetalle(idBaraja);
  } else {
    mostrarEstadisticasEnDetalle(idBaraja);
  }

  // Actualizar el título del detalle si lo tienes
  if (document.querySelector("#baraja-detalle-container .card-title")) {
    document.querySelector(
      "#baraja-detalle-container .card-title"
    ).textContent = barajaActual.nombre_baraja;
  }
}

function mostrarCartasEnDetalle(idBaraja) {
  console.log("Mostrando cartas para baraja:", idBaraja); // Debug 1

  const cartasBaraja = cartas.filter((c) => {
    console.log(
      "Carta:",
      c.id_carta,
      "Baraja:",
      c.id_baraja,
      "Nombre:",
      c.nombre
    ); // Debug 2
    return c.id_baraja === idBaraja;
  });

  console.log("Cartas filtradas:", cartasBaraja); // Debug 3

  const container = document.getElementById("cartas-container");
  container.innerHTML = "";

  cartasBaraja.forEach((carta) => {
    const cardElement = document.createElement("div");
    cardElement.className = "col-md-3 mb-3";
    cardElement.innerHTML = `
      <div class="card">
        <img src="../cartas/${carta.id_carta}.jpg" class="card-img-top" alt="${carta.nombre}">
        <div class="card-body">
          <h6 class="carta-nombre">${carta.nombre}</h6>
        </div>
      </div>
    `;
    container.appendChild(cardElement);
  });
}

function mostrarEstadisticasEnDetalle(idBaraja) {
  const cartasBaraja = cartas.filter((c) => c.id_baraja === idBaraja);
  const container = document.getElementById("estadisticas-container");

  // Calcular estadísticas
  const mediaCoste = (
    cartasBaraja.reduce((sum, carta) => sum + carta.coste_monedas, 0) /
    cartasBaraja.length
  ).toFixed(2);

  const mediaCosteSinZonas = (
    cartasBaraja
      .filter((carta) => carta.tipo_carta !== 1)
      .reduce((sum, carta) => sum + carta.coste_monedas, 0) /
    cartasBaraja.filter((carta) => carta.tipo_carta !== 1).length
  ).toFixed(2);

  function calcularMedianaCartas(cartas) {
    const costes = cartas.map((carta) => carta.coste_monedas);
    costes.sort((a, b) => a - b);
    const n = costes.length;
    const mitad = Math.floor(n / 2);
    return n % 2 === 0
      ? (costes[mitad - 1] + costes[mitad]) / 2
      : costes[mitad];
  }

  const costeTotal = cartasBaraja.reduce(
    (sum, carta) => sum + carta.coste_monedas,
    0
  );

  const vidaMediaZonas = (
    cartasBaraja
      .filter((carta) => carta.tipo_carta === 1)
      .reduce((sum, carta) => sum + carta.vida, 0) /
    cartasBaraja.filter((carta) => carta.tipo_carta === 1).length
  ).toFixed(2);

  const invocaciones = cartasBaraja.filter((carta) => carta.tipo_carta === 2);
  const mediaFuerza = (
    invocaciones.reduce((sum, carta) => sum + carta.fuerza, 0) /
    invocaciones.length
  ).toFixed(2);

  const mediaVida = (
    invocaciones.reduce((sum, carta) => sum + carta.vida, 0) /
    invocaciones.length
  ).toFixed(2);

  const numTipos = {
    Zona: cartasBaraja.filter((carta) => carta.tipo_carta === 1).length,
    Invocacion: cartasBaraja.filter((carta) => carta.tipo_carta === 2).length,
    Evento: cartasBaraja.filter((carta) => carta.tipo_carta === 3).length,
    Reliquia: cartasBaraja.filter((carta) => carta.tipo_carta === 4).length,
  };

  // Distribución de costes
  const costes = cartasBaraja.map((carta) => carta.coste_monedas);
  const distribucionCostes = {};
  costes.forEach((coste) => {
    distribucionCostes[coste] = (distribucionCostes[coste] || 0) + 1;
  });

  // Mostrar estadísticas
  container.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h5>Estadísticas Detalladas</h5>
        <div class="stats-grid mb-3">
          <div class="stat-item">
            <span class="stat-label">Coste Medio (Con Zonas):</span>
            <span class="stat-value">${mediaCoste}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Coste Medio (Sin Zonas):</span>
            <span class="stat-value">${mediaCosteSinZonas}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Mediana de Costes:</span>
            <span class="stat-value">${Math.round(
              calcularMedianaCartas(cartasBaraja)
            )}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Coste Total:</span>
            <span class="stat-value">${costeTotal}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Fuerza Media (Invoc.):</span>
            <span class="stat-value">${Math.floor(mediaFuerza)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Vida Media (Invoc.):</span>
            <span class="stat-value">${Math.floor(mediaVida)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Vida Media (Zonas):</span>
            <span class="stat-value">${Math.round(vidaMediaZonas)}</span>
          </div>
        </div>

        <h5 class="mt-3">Tipos de Carta</h5>
        <div class="types-grid">
          ${Object.entries(numTipos)
            .map(
              ([tipo, cantidad]) => `
            <div class="type-item">
              <span class="type-label">${tipo}:</span>
              <span class="type-value">${cantidad}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      
      <div class="col-md-6">
        <h5>Distribución de Costes</h5>
        <canvas id="graficoCostesDetalle"></canvas>
      </div>
    </div>
  `;

  // Gráfico
  new Chart(document.getElementById("graficoCostesDetalle").getContext("2d"), {
    type: "bar",
    data: {
      labels: Object.keys(distribucionCostes),
      datasets: [
        {
          label: "Número de cartas",
          data: Object.values(distribucionCostes),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { display: true },
      },
    },
  });
}

// AQUI TENGO QUE DISTINGUIR SI ES DEL BANQUILLO O NO PARA SACARLOS SEPARADOS MAS ADELANTE
function mostrarCartasBaraja(idBaraja) {
  const cartasBaraja = cartas.filter((carta) => carta.id_baraja === idBaraja);
  const modalBody = document.getElementById("modalCartasBarajaBody");

  modalBody.innerHTML = ""; // Limpiar el modal

  cartasBaraja.forEach((carta) => {
    const cartaHTML = `
        <div class="card">
          <img src="../cartas/${carta.id_carta}.jpg" class="card-img-top" alt="${carta.nombre}" />
          <div class="card-body">
            <h5 class="card-title">${carta.nombre}</h5>
          </div>
        </div>
      `;

    modalBody.innerHTML += cartaHTML; // Agregar la carta al modal
  });

  // Mostrar el modal
  const modal = new bootstrap.Modal(
    document.getElementById("modalCartasBaraja")
  );
  modal.show();
}

function generarContenidoExportacion(idBaraja) {
  const cartasBaraja = cartas.filter((c) => c.id_baraja === idBaraja);
  const baraja = barajas.find((b) => b.id_baraja === idBaraja);

  // Contar tipos de cartas
  const contadorTipos = {
    1: 0, // Zona
    2: 0, // Invocación
    3: 0, // Evento
    4: 0, // Reliquia
  };

  // Calcular anchos máximos para alineación
  let maxNombre = 0;
  let maxTipo = 0;

  cartasBaraja.forEach((carta) => {
    maxNombre = Math.max(maxNombre, carta.nombre.length);
    const tipoLength = obtenerNombreTipo(carta.tipo_carta).length;
    maxTipo = Math.max(maxTipo, tipoLength);
  });

  // Asegurar mínimos para los headers
  maxNombre = Math.max(maxNombre, "Nombre".length);
  maxTipo = Math.max(maxTipo, "Tipo".length);

  // Generar contenido de las cartas
  let contenido = `BARAJAS: ${baraja.nombre_baraja}\n`;
  contenido += `Total cartas: ${cartasBaraja.length}\n\n`;

  // Cabecera de la tabla
  contenido += `${"Nombre".padEnd(maxNombre)}  ${"Tipo".padEnd(
    maxTipo
  )}  Coste\n`;
  contenido += `${"-".repeat(maxNombre)}  ${"-".repeat(maxTipo)}  ${"-".repeat(
    5
  )}\n`;

  // Filas de datos
  cartasBaraja.forEach((carta) => {
    const tipo = obtenerNombreTipo(carta.tipo_carta);
    contenido += `${carta.nombre.padEnd(maxNombre)}  ${tipo.padEnd(
      maxTipo
    )}  ${carta.coste_monedas.toString().padStart(2)} ⊙\n`;

    // Contar tipos
    contadorTipos[carta.tipo_carta]++;
  });

  // Añadir resumen de tipos
  contenido += "\nRESUMEN DE TIPOS:\n";
  contenido += "----------------\n";
  contenido += `Zonas(–):        ${contadorTipos[1]}\n`;
  contenido += `Invocaciones(⁑): ${contadorTipos[2]}\n`;
  contenido += `Eventos(≈):      ${contadorTipos[3]}\n`;
  contenido += `Reliquias(ψ):    ${contadorTipos[4]}\n`;

  return contenido;
}

function exportarBaraja() {
  if (!barajaActual) return;

  const contenido = generarContenidoExportacion(barajaActual.id_baraja);
  const blob = new Blob([contenido], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `baraja_${barajaActual.nombre_baraja.replace(/\s+/g, "_")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function simularManoInicial(idBaraja) {
  sessionStorage.setItem("barajaSimulacion", idBaraja);
  window.location.href = "simulacionMano.html";
}

function obtenerNombreTipo(tipo) {
  const tipos = {
    1: "Zona",
    2: "Invocación",
    3: "Evento",
    4: "Reliquia",
  };
  return tipos[tipo] || "Desconocido";
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();

  document.getElementById("cartas-tab").addEventListener("click", (e) => {
    e.preventDefault();
    if (barajaActual) {
      mostrarCartasEnDetalle(barajaActual.id_baraja);
    }
  });

  document.getElementById("estadisticas-tab").addEventListener("click", (e) => {
    e.preventDefault();
    if (barajaActual) {
      mostrarEstadisticasEnDetalle(barajaActual.id_baraja);
    }
  });

  document
    .getElementById("exportarBarajaBtn")
    .addEventListener("click", exportarBaraja);
});
