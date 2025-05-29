document.addEventListener("DOMContentLoaded", async function () {
  let currentStateIndex = 0;
  let cartasData = [];
  let tutorialData = [];

  try {
    // Cargar datos de cartas y tutorial desde JSON
    const [cartasResponse, tutorialResponse] = await Promise.all([
      fetch("/json/cartas.json"),
      fetch("/json/tutoriales.json"),
    ]);

    cartasData = await cartasResponse.json();
    const tutoriales = await tutorialResponse.json();
    tutorialData = tutoriales.tutoriales.dificil;

    loadGameState(currentStateIndex);
    updateButtonStates();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  }

  function loadGameState(index) {
    if (index < 0 || index >= tutorialData.length) return;

    // Mostrar modal de resumen si estamos en el último paso y avanzamos
    if (index === tutorialData.length - 1 && currentStateIndex < index) {
      const resumenModal = new bootstrap.Modal(
        document.getElementById("resumenModal")
      );
      resumenModal.show();
    }

    currentStateIndex = index;
    const state = tutorialData[index];

    // Actualizar UI
    document.querySelector(".turno").textContent = state.turn;
    document.querySelector(".monedas").textContent = `${state.coins} `;
    document.querySelector(".phase-name").textContent = state.phase;
    document.querySelector(
      ".player-turn .badge"
    ).textContent = `Turno del ${state.player}`;
    document.querySelector(".tutorial-content p").innerHTML = state.description;

    // cargamos el tablero
    setupBoard(state.board);
    updateButtonStates();
  }

  function setupBoard(boardState) {
    Object.entries(boardState).forEach(([areaId, cards]) => {
      const area = document.getElementById(areaId);
      if (!area) return;

      area.innerHTML = "";
      cards.forEach((card) => {
        const cardData = typeof card === "object" ? card : { id: card };
        const carta = cartasData.find((c) => c.id_carta === cardData.id);
        if (!carta) return;

        const cardElement = createCardElement(carta, cardData);
        area.appendChild(cardElement);
      });
    });
  }

  function createCardElement(carta, cardData = {}) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card-wrapper";
    cardDiv.dataset.id = carta.id_carta;
    cardDiv.style.position = "relative"; // Para posicionar la vida

    const img = document.createElement("img");
    img.src = `/cartas/${carta.id_carta}.jpg`;
    img.alt = carta.nombre;
    img.className = "card-img";

    // giramos la carta
    if (cardData.girada) {
      img.style.transform = "rotate(90deg)";
      img.style.cursor = "n-resize";
    }

    img.onerror = function () {
      this.src = "/cartas/0.jpg";
      this.style.border = "2px dashed red";
    };

    img.addEventListener("click", function () {
      const modal = document.getElementById("modalZoom");
      const modalImg = document.getElementById("imagenZoom");
      modal.style.display = "block";
      modalImg.src = this.src;
    });

    cardDiv.appendChild(img);

    // Mostrar vida si existe
    if (cardData.vida !== undefined) {
      const vidaElement = document.createElement("div");
      vidaElement.className = "card-life";
      vidaElement.textContent = cardData.vida;
      cardDiv.appendChild(vidaElement);
    }

    return cardDiv;
  }

  function updateButtonStates() {
    const prevBtn = document.getElementById("prev-step");
    const nextBtn = document.getElementById("next-step");

    prevBtn.disabled = currentStateIndex === 0;
    nextBtn.disabled = currentStateIndex === tutorialData.length - 1;
  }

  // Controladores de navegación
  document.getElementById("prev-step").addEventListener("click", () => {
    loadGameState(currentStateIndex - 1);
  });

  document.getElementById("next-step").addEventListener("click", () => {
    loadGameState(currentStateIndex + 1);
  });

  // Cerrar modal
  document.querySelector(".cerrar-zoom").addEventListener("click", () => {
    document.getElementById("modalZoom").style.display = "none";
  });

  // Evento para repetir tutorial
  document.getElementById("replayTutorial").addEventListener("click", () => {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("resumenModal")
    );
    modal.hide();
    loadGameState(0); // Volver al primer paso
  });
});
