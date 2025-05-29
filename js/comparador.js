let barajas = [];
let cartas = [];

// Cargar datos de barajas y cartas desde JSON
async function cargarDatos() {
  try {
    const responseBarajas = await fetch("../json/barajas.json");
    if (!responseBarajas.ok) throw new Error("Error al cargar barajas.json");
    barajas = await responseBarajas.json();

    const responseCartas = await fetch("../json/cartas.json");
    if (!responseCartas.ok) throw new Error("Error al cargar cartas.json");
    cartas = await responseCartas.json();

    // Llenar selectores de cartas y barajas
    llenarSelectores();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }
}

// Función para determinar el tipo de carta
const determinarTipo = function (tipo) {
  switch (tipo) {
    case 1:
      return "Zona";
    case 2:
      return "Invocación";
    case 3:
      return "Evento";
    case 4:
      return "Reliquia";
    default:
      return "Desconocido";
  }
};

// Llenar selectores de cartas y barajas
function llenarSelectores() {
  const selectorCartas1 = document.getElementById("carta1");
  const selectorCartas2 = document.getElementById("carta2");
  const selectorBarajas1 = document.getElementById("baraja1");
  const selectorBarajas2 = document.getElementById("baraja2");

  // Llenar selector de primera carta
  cartas.forEach((carta) => {
    const tipo = determinarTipo(carta.tipo_carta);
    const option = document.createElement("option");
    option.value = carta.id_carta;
    option.textContent = `${carta.nombre} -- ${tipo}`;
    option.dataset.tipo = carta.tipo_carta;
    selectorCartas1.appendChild(option);
  });

  // Llenar selectores de barajas
  barajas.forEach((baraja) => {
    const option = document.createElement("option");
    option.value = baraja.id_baraja;
    option.textContent = baraja.nombre_baraja;
    selectorBarajas1.appendChild(option.cloneNode(true));
    selectorBarajas2.appendChild(option.cloneNode(true));
  });

  // Evento para cambiar entre comparación de cartas/barajas
  document.getElementById("tipoComparacion").addEventListener("change", (e) => {
    const tipo = e.target.value;
    document.getElementById("selectorCartas").style.display =
      tipo === "cartas" ? "block" : "none";
    document.getElementById("selectorBarajas").style.display =
      tipo === "barajas" ? "block" : "none";
  });

  // Evento para actualizar el segundo selector de cartas según el tipo de la primera
  selectorCartas1.addEventListener("change", function () {
    const carta1Id = this.value;
    const carta1 = cartas.find((c) => c.id_carta == carta1Id);

    if (carta1) {
      // Habilitar y actualizar el segundo selector
      selectorCartas2.disabled = false;
      selectorCartas2.classList.remove("select-disabled");

      // Limpiar y llenar con cartas del mismo tipo
      selectorCartas2.innerHTML = "";

      // Añadir opción por defecto
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Selecciona una carta del tipo ${determinarTipo(
        carta1.tipo_carta
      )}`;
      selectorCartas2.appendChild(defaultOption);

      // Filtrar cartas del mismo tipo (excluyendo la ya seleccionada)
      const cartasFiltradas = cartas.filter(
        (c) => c.tipo_carta === carta1.tipo_carta && c.id_carta != carta1Id
      );

      cartasFiltradas.forEach((carta) => {
        const option = document.createElement("option");
        option.value = carta.id_carta;
        option.textContent = `${carta.nombre} -- ${determinarTipo(
          carta.tipo_carta
        )}`;
        selectorCartas2.appendChild(option);
      });
    } else {
      // Deshabilitar si no hay carta seleccionada
      selectorCartas2.disabled = true;
      selectorCartas2.classList.add("select-disabled");
      selectorCartas2.innerHTML =
        '<option value="">Selecciona primero una carta</option>';
    }
  });
}

// Función para comparar
function comparar() {
  const tipo = document.getElementById("tipoComparacion").value;

  if (tipo === "cartas") {
    const carta1Id = document.getElementById("carta1").value;
    const carta2Id = document.getElementById("carta2").value;

    if (!carta1Id || !carta2Id) {
      alert("Por favor selecciona dos cartas para comparar");
      return;
    }

    const carta1 = cartas.find((c) => c.id_carta == carta1Id);
    const carta2 = cartas.find((c) => c.id_carta == carta2Id);
    mostrarComparacionCartas(carta1, carta2);
  } else if (tipo === "barajas") {
    const baraja1Id = document.getElementById("baraja1").value;
    const baraja2Id = document.getElementById("baraja2").value;

    if (!baraja1Id || !baraja2Id) {
      alert("Por favor selecciona dos barajas para comparar");
      return;
    }

    const baraja1 = barajas.find((b) => b.id_baraja == baraja1Id);
    const baraja2 = barajas.find((b) => b.id_baraja == baraja2Id);
    mostrarComparacionBarajas(baraja1, baraja2);
  }
}

// mostrar la comp de las cartas
function mostrarComparacionCartas(carta1, carta2) {
  const graficosComparacion = document.getElementById("graficosComparacion");
  graficosComparacion.innerHTML = `
    <h3>Cartas</h3>
    <div class="row">
      <div class="col-md-4 text-center">
        <img src="../cartas/${
          carta1.id_carta
        }.jpg" class="img-thumbnail" style="max-width: 250px;" alt="${
    carta1.nombre
  }" />
        <p class="w"><strong>${carta1.nombre}</strong></p>
        <p class="w"><strong>Tipo: </strong>${obtenerTipoCarta(
          carta1.tipo_carta
        )}</p>
        <p class="w"><strong>Coste en Monedas:</strong> ${
          carta1.coste_monedas
        }</p>
      </div>
      <div class="col-md-4 text-center">
        <canvas id="graficoCartas" style="width: 100%; max-width: 600px; height: 300px; margin: auto;"></canvas>
      </div>
      <div class="col-md-4 text-center">
        <img src="../cartas/${
          carta2.id_carta
        }.jpg" class="img-thumbnail" style="max-width: 250px;" alt="${
    carta2.nombre
  }" />
        <p class="w"><strong>${carta2.nombre}</strong></p>
        <p class="w"><strong>Tipo: </strong>${obtenerTipoCarta(
          carta2.tipo_carta
        )}</p>
        <p class="w"><strong>Coste en Monedas:</strong> ${
          carta2.coste_monedas
        }</p>
      </div>
    </div>
  `;

  const ctx = document.getElementById("graficoCartas").getContext("2d");
  const labels = [];
  const data1 = [];
  const data2 = [];

  if (carta1.tipo_carta === 1) {
    // Zona (sin coste en el gráfico)
    labels.push("Vida");
    data1.push(carta1.vida);
    data2.push(carta2.vida);
  } else if (carta1.tipo_carta === 2) {
    // Invocación (sin coste en el gráfico)
    labels.push("Fuerza", "Vida");
    data1.push(carta1.fuerza, carta1.vida);
    data2.push(carta2.fuerza, carta2.vida);
  } else if (carta1.tipo_carta === 3 || carta1.tipo_carta === 4) {
    // Evento o Reliquia (solo muestran el coste en la UI)
    labels.push("No aplicable");
    data1.push(0);
    data2.push(0);
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: carta1.nombre,
          data: data1,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: carta2.nombre,
          data: data2,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  });
}

// Mostrar comparación de barajas
function mostrarComparacionBarajas(baraja1, baraja2) {
  const cartasBaraja1 = cartas.filter((c) => c.id_baraja === baraja1.id_baraja);
  const cartasBaraja2 = cartas.filter((c) => c.id_baraja === baraja2.id_baraja);

  const graficosComparacion = document.getElementById("graficosComparacion");
  graficosComparacion.innerHTML = `
    <h3>Barajas</h3>
    <div class="row">
      <div class="col-md-4 text-center">
        <img src="../barajas/${baraja1.id_baraja}.jpg" class="img-thumbnail" style="max-width: 250px;" alt="${baraja1.nombre_baraja}" />
        <p class="nombre-baraja"><strong>${baraja1.nombre_baraja}</strong></p>
      </div>
      <div class="col-md-4 text-center">
        <canvas id="graficoBarajas" style="width: 100%; max-width: 800px; height: 300px; margin: auto;"></canvas>
      </div>
      <div class="col-md-4 text-center">
        <img src="../barajas/${baraja2.id_baraja}.jpg" class="img-thumbnail" style="max-width: 250px;" alt="${baraja2.nombre_baraja}" />
        <p class="nombre-baraja"><strong>${baraja2.nombre_baraja}</strong></p>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-12">
        <h4>Curvas de Coste Comparadas</h4>
        <canvas id="graficoCurvasCoste" style="width: 100%; max-width: 1000px; height: 300px; margin: auto;"></canvas>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-12">
        <h4>Distribución de Tipos de Cartas</h4>
        <canvas id="graficoDistribucionTipos" style="width: 100%; max-width: 1000px; height: 300px; margin: auto;"></canvas>
      </div>
    </div>
  `;

  const ctx = document.getElementById("graficoBarajas").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Fuerza Media (Invocaciones)",
        "Vida Media (Invocaciones)",
        "Vida Media (Zonas)",
      ],
      datasets: [
        {
          label: baraja1.nombre_baraja,
          data: [
            Math.floor(calcularMediaFuerza(cartasBaraja1)),
            Math.floor(calcularMediaVidaInvocaciones(cartasBaraja1)),
            Math.floor(calcularMediaVidaZonas(cartasBaraja1)),
          ],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: baraja2.nombre_baraja,
          data: [
            Math.floor(calcularMediaFuerza(cartasBaraja2)),
            Math.floor(calcularMediaVidaInvocaciones(cartasBaraja2)),
            Math.floor(calcularMediaVidaZonas(cartasBaraja2)),
          ],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
        },
        title: {
          display: true,
          color: "white",
          font: {
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  });

  // Gráfico de curvas de coste
  const ctxCurvas = document
    .getElementById("graficoCurvasCoste")
    .getContext("2d");
  const distribucionCostes1 = calcularDistribucionCostes(cartasBaraja1);
  const distribucionCostes2 = calcularDistribucionCostes(cartasBaraja2);

  // Asegurar que se incluyan todos los costes, el 0 tambien
  const costesUnicos = new Set([
    ...Object.keys(distribucionCostes1),
    ...Object.keys(distribucionCostes2),
  ]);
  const labelsCostes = Array.from(costesUnicos).sort((a, b) => a - b);

  new Chart(ctxCurvas, {
    type: "bar",
    data: {
      labels: labelsCostes,
      datasets: [
        {
          label: baraja1.nombre_baraja,
          data: labelsCostes.map((coste) => distribucionCostes1[coste] || 0),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: baraja2.nombre_baraja,
          data: labelsCostes.map((coste) => distribucionCostes2[coste] || 0),
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
        },
        title: {
          display: true,
          color: "white",
          font: {
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  });

  // gráfico de distribución de tipos de cartas
  const ctxTipos = document
    .getElementById("graficoDistribucionTipos")
    .getContext("2d");

  // Contar tipos de cartas para cada baraja
  const tipos = [1, 2, 3, 4];
  const labelsTipos = tipos.map((tipo) => obtenerTipoCarta(tipo));

  const datosBaraja1 = tipos.map(
    (tipo) => cartasBaraja1.filter((c) => c.tipo_carta === tipo).length
  );

  const datosBaraja2 = tipos.map(
    (tipo) => cartasBaraja2.filter((c) => c.tipo_carta === tipo).length
  );

  new Chart(ctxTipos, {
    type: "bar",
    data: {
      labels: labelsTipos,
      datasets: [
        {
          label: baraja1.nombre_baraja,
          data: datosBaraja1,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: baraja2.nombre_baraja,
          data: datosBaraja2,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
        },
        title: {
          display: true,
          text: "Distribución de Tipos de Cartas",
          color: "white",
          font: {
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
            stepSize: 1,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "white",
            font: {
              weight: "bold",
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  });
}

// Obtener el tipo de carta como texto
function obtenerTipoCarta(tipo) {
  switch (tipo) {
    case 1:
      return "Zona";
    case 2:
      return "Invocación";
    case 3:
      return "Evento";
    case 4:
      return "Reliquia";
    default:
      return "Desconocido";
  }
}

// Funciones auxiliares para calcular medias
function calcularMediaCoste(cartas) {
  return (
    cartas.reduce((sum, carta) => sum + carta.coste_monedas, 0) / cartas.length
  ).toFixed(2);
}

function calcularMediaFuerza(cartas) {
  const invocaciones = cartas.filter((c) => c.tipo_carta === 2);
  return (
    invocaciones.reduce((sum, carta) => sum + carta.fuerza, 0) /
    invocaciones.length
  ).toFixed(2);
}

function calcularMediaVidaInvocaciones(cartas) {
  const invocaciones = cartas.filter((c) => c.tipo_carta === 2);
  return (
    invocaciones.reduce((sum, carta) => sum + carta.vida, 0) /
    invocaciones.length
  ).toFixed(2);
}

function calcularMediaVidaZonas(cartas) {
  const zonas = cartas.filter((c) => c.tipo_carta === 1);
  return (
    zonas.reduce((sum, carta) => sum + carta.vida, 0) / zonas.length
  ).toFixed(2);
}

// Calcular la distribución de costes
function calcularDistribucionCostes(cartas) {
  const costes = cartas.map((carta) => carta.coste_monedas);
  const distribucionCostes = {};
  costes.forEach((coste) => {
    distribucionCostes[coste] = (distribucionCostes[coste] || 0) + 1;
  });
  return distribucionCostes;
}

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", cargarDatos);
