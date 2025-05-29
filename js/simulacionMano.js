// Variables globales
let cartasBaraja = [];
let cartasZonas = [];
let cartasMazo = [];
let mano = [];
let mulliganCount = 0;
let monedas = 1;
let turno = 1;
let cartasEnBattlefield = [];
let cartasEnBattlefieldZonas = [];
let cartasEnCementerio = [];
let subiendo = true;

// Inicialización
document.addEventListener("DOMContentLoaded", async function () {
  await cargarDatos();
  inicializarSimulacion();
  configurarDragAndDrop();
  configurarContadores();
  configurarModalZoom();

  // Botones principales
  document
    .getElementById("btnNuevaMano")
    .addEventListener("click", inicializarSimulacion);
  document
    .getElementById("btnMulligan")
    .addEventListener("click", hacerMulligan);
  document.getElementById("mazo").addEventListener("click", robarCarta);
  document
    .getElementById("btnSiguienteTurno")
    .addEventListener("click", siguienteTurno);
});

// Cargar datos de la baraja de JSON
async function cargarDatos() {
  const idBaraja = sessionStorage.getItem("barajaSimulacion");

  try {
    const response = await fetch("../json/cartas.json");
    if (!response.ok) throw new Error("Error al cargar cartas.json");

    const todasLasCartas = await response.json();
    cartasBaraja = todasLasCartas.filter(
      (carta) => carta.id_baraja === idBaraja
    );

    cartasZonas = cartasBaraja.filter((carta) => carta.tipo_carta === 1);
    cartasMazo = cartasBaraja.filter((carta) => carta.tipo_carta !== 1);
  } catch (error) {
    console.error("Error:", error);
  }
}

// init simulación
function inicializarSimulacion() {
  mulliganCount = 0;
  monedas = 1;
  turno = 1;
  cartasEnBattlefield = [];
  cartasEnBattlefieldZonas = [];
  cartasEnCementerio = [];

  document.getElementById(
    "contadorMulligan"
  ).textContent = `${mulliganCount}/2`;
  document.getElementById("btnMulligan").disabled = false;

  cartasZonas = cartasBaraja.filter((carta) => carta.tipo_carta === 1);
  cartasMazo = cartasBaraja.filter((carta) => carta.tipo_carta !== 1);

  barajarMazo(cartasZonas);
  barajarMazo(cartasMazo);

  mano = repartirMano(5);

  mostrarCartas();
}

function actualizarContadoresSecciones() {
  document.getElementById("contador-mano").textContent = mano.length;
  document.getElementById("contador-mazo").textContent = cartasMazo.length;
  document.getElementById("contador-cementerio").textContent =
    cartasEnCementerio.length;
  document.getElementById("contador-zonas").textContent = cartasZonas.length;
  document.getElementById("contador-battlefield").textContent =
    cartasEnBattlefield.length;
  document.getElementById("contador-zonas-construidas").textContent =
    cartasEnBattlefieldZonas.length;
}

// Función para hacer mulligan
function hacerMulligan() {
  if (mulliganCount >= 2) {
    alert("No puedes hacer más mulligans. Máximo 2 cambios permitidos.");
    return;
  }

  mulliganCount++;
  document.getElementById(
    "contadorMulligan"
  ).textContent = `${mulliganCount}/2`;

  cartasMazo = cartasMazo.concat(mano);
  barajarMazo(cartasMazo);
  mano = repartirMano(5);

  mostrarCartas();

  if (mulliganCount >= 2) {
    document.getElementById("btnMulligan").disabled = true;
  }
}

function siguienteTurno() {
  // 1. Ajustar el turno
  if (subiendo) {
    turno++;
    if (turno === 12) subiendo = false;
  } else {
    turno--;
    if (turno === 1) subiendo = true;
  }

  // 2. Aumentar monedas
  monedas = turno;

  // 3. Restablecer cartas giradas
  cartasEnBattlefield.forEach((carta) => {
    carta.girada = false;
  });

  // 4. Verificar límite de cartas en mano (6)
  const LIMITE_CARTAS_MANO = 6;
  if (mano.length > LIMITE_CARTAS_MANO) {
    const exceso = mano.length - LIMITE_CARTAS_MANO;
    alert(
      `¡Tienes ${exceso} carta(s) de más!\nDebes descartar ${exceso} carta(s) de tu mano.`
    );
  } else {
    // 5. Robar carta del mazo, si tengo el limite correcto antes
    if (cartasMazo.length > 0) {
      mano.push(cartasMazo.pop());
    } else {
      alert("No quedan cartas en el mazo para robar");
    }
  }

  // 6. Actualizar la interfaz
  actualizarContadores();
  mostrarCartas();
}

// Barajar mazo
function barajarMazo(mazo) {
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
}

// Repartir mano
function repartirMano(cantidad) {
  const nuevaMano = [];
  for (let i = 0; i < cantidad && cartasMazo.length > 0; i++) {
    nuevaMano.push(cartasMazo.pop());
  }
  return nuevaMano;
}

// Robar carta del mazo
function robarCarta() {
  if (cartasMazo.length > 0) {
    mano.push(cartasMazo.pop());
    mostrarCartas();
  } else {
    alert("No quedan cartas en el mazo");
  }
}

function actualizarEstadisticasMano() {
  if (mano.length === 0) {
    // Resetear contadores si no hay cartas
    document.getElementById("coste-medio").textContent = "0";
    document.getElementById("contador-invocacion").textContent = "0";
    document.getElementById("contador-evento").textContent = "0";
    document.getElementById("contador-reliquia").textContent = "0";
    return;
  }

  // Calcular estadísticas
  let costeTotal = 0;
  let invocaciones = 0;
  let eventos = 0;
  let reliquias = 0;

  mano.forEach((carta) => {
    costeTotal += carta.coste_monedas || 0;

    // Asume que el tipo de carta está en carta.tipo (ajusta según tu estructura de datos)
    if (carta.tipo_carta === 2) invocaciones++;
    else if (carta.tipo_carta === 3) eventos++;
    else if (carta.tipo_carta === 4) reliquias++;
  });

  // Actualizar UI
  document.getElementById("coste-medio").textContent = (
    costeTotal / mano.length
  ).toFixed(1);
  document.getElementById("contador-invocacion").textContent = invocaciones;
  document.getElementById("contador-evento").textContent = eventos;
  document.getElementById("contador-reliquia").textContent = reliquias;
}

// Mostrar todas las cartas
function mostrarCartas() {
  mostrarMano();
  mostrarZonas();
  mostrarMazo();
  mostrarBattlefield();
  mostrarBattlefieldZonas();
  mostrarCementerio();
  actualizarContadores();
  actualizarContadoresSecciones();
  actualizarEstadisticasMano();
}

function mostrarMano() {
  const container = document.getElementById("mano");
  container.innerHTML = "";

  mano.forEach((carta) => {
    const cartaElement = crearElementoCarta(carta, "mano");
    container.appendChild(cartaElement);
  });
}

function mostrarZonas() {
  const container = document.getElementById("zonas");
  container.innerHTML = "";

  cartasZonas.forEach((carta) => {
    const cartaElement = crearElementoCarta(carta, "zonas");
    container.appendChild(cartaElement);
  });
}

function mostrarMazo() {
  const container = document.getElementById("mazo");
  container.innerHTML = "";

  if (cartasMazo.length > 0) {
    const cartaElement = document.createElement("img");
    cartaElement.src = "../cartas/0.jpg";
    cartaElement.className = "card-img";
    cartaElement.style.cursor = "pointer";
    container.appendChild(cartaElement);
  }
}

function mostrarBattlefield() {
  const container = document.getElementById("battlefield");
  container.innerHTML = "";

  cartasEnBattlefield.forEach((carta) => {
    const cartaElement = crearElementoCarta(carta, "battlefield");
    container.appendChild(cartaElement);
  });
}

function mostrarBattlefieldZonas() {
  const container = document.getElementById("battlefield-zones");
  container.innerHTML = "";

  cartasEnBattlefieldZonas.forEach((carta) => {
    const cartaElement = crearElementoCarta(carta, "battlefield-zones");
    container.appendChild(cartaElement);
  });
}

function mostrarCementerio() {
  const container = document.getElementById("cementerio");
  container.innerHTML = "";

  if (cartasEnCementerio.length === 0) {
    container.innerHTML = "<p>No hay cartas en el cementerio</p>";
  } else {
    // Solo mostramos la última carta (último elemento del array)
    const ultimaCarta = cartasEnCementerio[cartasEnCementerio.length - 1];
    const cartaElement = crearElementoCarta(ultimaCarta, "cementerio");
    container.appendChild(cartaElement);
  }
}

function crearElementoCarta(carta, areaOrigen) {
  const cartaElement = document.createElement("img");
  const esZonaConstruida = areaOrigen === "battlefield-zones";
  const esBattlefield = areaOrigen === "battlefield";

  // Configuración inicial basada en el estado
  cartaElement.src =
    esZonaConstruida && carta.volteada
      ? "../cartas/0.jpg"
      : `../cartas/${carta.id_carta}.jpg`;

  if (esBattlefield && carta.girada) {
    cartaElement.style.transform = "rotate(90deg)";
  }

  cartaElement.className = "card-img";
  cartaElement.draggable = true;
  cartaElement.dataset.id = carta.id_carta;

  // Control de clicks
  let clickCount = 0;
  let clickTimer = null;

  cartaElement.addEventListener("click", (e) => {
    clickCount++;
    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        // Click simple (zoom)
        if (!e.defaultPrevented) {
          mostrarZoomCarta(carta);
        }
        clickCount = 0;
      }, 300);
    } else if (clickCount === 2) {
      // Doble click -- girar o voltear
      clearTimeout(clickTimer);
      e.preventDefault();

      if (esZonaConstruida) {
        // Alternar dorso para zonas construidas
        carta.volteada = !carta.volteada;
        cartaElement.src = carta.volteada
          ? "../cartas/0.jpg"
          : `../cartas/${carta.id_carta}.jpg`;
      } else if (esBattlefield) {
        // Alternar giro 90° para cartas en battlefield
        carta.girada = !carta.girada;
        cartaElement.style.transform = carta.girada
          ? "rotate(90deg)"
          : "rotate(0deg)";
      }
      clickCount = 0;
    }
  });

  cartaElement.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        id: carta.id_carta,
        origen: areaOrigen,
        volteada: carta.volteada || false,
        girada: carta.girada || false,
      })
    );
  });

  return cartaElement;
}

// arrastra y suelta
function configurarDragAndDrop() {
  const areas = [
    "battlefield",
    "battlefield-zones",
    "mano",
    "zonas",
    "cementerio",
  ];

  areas.forEach((areaId) => {
    const area = document.getElementById(areaId);

    area.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    area.addEventListener("drop", (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const carta = encontrarCarta(data.id, data.origen, {
        volteada: data.volteada,
        girada: data.girada,
      });

      if (carta) {
        moverCarta(carta, data.origen, areaId);
        mostrarCartas();
      }
    });
  });
}

function encontrarCarta(id, areaOrigen, data) {
  let carta;
  switch (areaOrigen) {
    case "mano":
      carta = mano.find((c) => c.id_carta === id);
      break;
    case "zonas":
      carta = cartasZonas.find((c) => c.id_carta === id);
      break;
    case "battlefield":
      carta = cartasEnBattlefield.find((c) => c.id_carta === id);
      break;
    case "battlefield-zones":
      carta = cartasEnBattlefieldZonas.find((c) => c.id_carta === id);
      break;
    case "cementerio":
      carta = cartasEnCementerio.find((c) => c.id_carta === id);
      break;
    default:
      return null;
  }

  if (carta && data) {
    if (data.volteada !== undefined) carta.volteada = data.volteada;
    if (data.girada !== undefined) carta.girada = data.girada;
  }
  return carta;
}

function moverCarta(carta, origen, destino) {
  // Eliminar de origen
  switch (origen) {
    case "mano":
      mano = mano.filter((c) => c.id_carta !== carta.id_carta);
      break;
    case "zonas":
      cartasZonas = cartasZonas.filter((c) => c.id_carta !== carta.id_carta);
      break;
    case "battlefield":
      cartasEnBattlefield = cartasEnBattlefield.filter(
        (c) => c.id_carta !== carta.id_carta
      );
      break;
    case "battlefield-zones":
      cartasEnBattlefieldZonas = cartasEnBattlefieldZonas.filter(
        (c) => c.id_carta !== carta.id_carta
      );
      break;
    case "cementerio":
      cartasEnCementerio = cartasEnCementerio.filter(
        (c) => c.id_carta !== carta.id_carta
      );
      break;
  }

  // Agregar a destino (inicializando estados si no existen)
  switch (destino) {
    case "battlefield":
      if (!carta.hasOwnProperty("girada")) {
        carta.girada = false;
      }
      cartasEnBattlefield.push(carta);
      break;
    case "battlefield-zones":
      if (!carta.hasOwnProperty("volteada")) {
        carta.volteada = false;
      }
      cartasEnBattlefieldZonas.push(carta);
      break;
    case "mano":
      carta.girada = false; // Resetear estado al volver a mano
      mano.push(carta);
      break;
    case "zonas":
      cartasZonas.push(carta);
      break;
    case "cementerio":
      cartasEnCementerio.push(carta);
      break;
  }
}

// Configurar contadores
function configurarContadores() {
  document.querySelectorAll(".incrementar-moneda").forEach((btn) => {
    btn.addEventListener("click", () => {
      monedas++;
      actualizarContadores();
    });
  });

  document.querySelectorAll(".decrementar-moneda").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (monedas > 0) monedas--;
      actualizarContadores();
    });
  });

  document.querySelectorAll(".incrementar-turno").forEach((btn) => {
    btn.addEventListener("click", () => {
      turno++;
      actualizarContadores();
    });
  });

  document.querySelectorAll(".decrementar-turno").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (turno > 1) turno--;
      actualizarContadores();
    });
  });
}

// Actualizar contadores
function actualizarContadores() {
  document.querySelector(".monedas").textContent = `${monedas} `;
  document.querySelector(".turno").textContent = `${turno} `;
  document.getElementById(
    "contadorMulligan"
  ).textContent = `${mulliganCount}/2`;
}

// Configurar zoom cartas
function configurarModalZoom() {
  const modal = document.getElementById("modalZoom");
  const cerrar = document.querySelector(".cerrar-zoom");

  cerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Mostrar zoom de carta
function mostrarZoomCarta(carta) {
  const modal = document.getElementById("modalZoom");
  const imagen = document.getElementById("imagenZoom");

  imagen.src = `../cartas/${carta.id_carta}.jpg`;
  imagen.alt = carta.nombre;
  modal.style.display = "block";
}
