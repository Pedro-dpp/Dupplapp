// Palabras clave relacionadas con el juego que cargamos desde JSON
let palabras = [];

fetch("../json/palabras.json")
  .then((res) => res.json())
  .then((data) => {
    palabras = data;
    inicializarJuego();
  })
  .catch((err) => {
    wordleMessage.innerHTML = `<div class="alert alert-danger">Error al cargar palabras: ${err}</div>`;
  });

let palabraCorrecta;
let definicionCorrecta;
let intentos = 6;
let intentoActual = 0;
let racha = 0; // Variable para llevar la cuenta de la racha de aciertos

// Elementos del DOM
const wordleBoard = document.getElementById("wordle-board");
const wordleMessage = document.getElementById("wordle-message");
const wordleReset = document.getElementById("wordle-reset");
const wordleRacha = document.getElementById("wordle-racha"); // elemento para mostrar la racha

// Inicializar el juego
function inicializarJuego() {
  if (palabras.length === 0) {
    wordleMessage.innerHTML = "¡Has adivinado todas las palabras! 🎉";
    wordleReset.style.display = "none";
    return;
  }

  const palabraAleatoria =
    palabras[Math.floor(Math.random() * palabras.length)];
  palabraCorrecta = palabraAleatoria.palabra;
  definicionCorrecta = palabraAleatoria.definicion;

  intentoActual = 0;
  wordleBoard.innerHTML = "";
  wordleMessage.innerHTML = "";
  wordleReset.style.display = "none";
  generarTablero();

  document.removeEventListener("keydown", manejarEntrada);
  document.addEventListener("keydown", manejarEntrada);
}

// Generar el tablero del Wordle
function generarTablero() {
  for (let i = 0; i < intentos; i++) {
    const row = document.createElement("div");
    row.classList.add("wordle-row");
    for (let j = 0; j < palabraCorrecta.length; j++) {
      const cell = document.createElement("div");
      cell.classList.add("wordle-cell");
      row.appendChild(cell);
    }
    wordleBoard.appendChild(row);
  }
}

function manejarEntrada(event) {
  if (event.key === "Enter") {
    verificarIntento();
  } else if (event.key === "Backspace") {
    borrarLetra();
  } else if (/^[A-Za-z]$/.test(event.key)) {
    agregarLetra(event.key.toUpperCase());
  }
}

function agregarLetra(letra) {
  const row = wordleBoard.children[intentoActual];
  const cell = row.querySelector(".wordle-cell:empty");
  if (cell) {
    cell.textContent = letra;
  }
}

function borrarLetra() {
  const row = wordleBoard.children[intentoActual];
  const cells = row.querySelectorAll(".wordle-cell");
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].textContent !== "") {
      cells[i].textContent = "";
      break;
    }
  }
}

function verificarIntento() {
  const row = wordleBoard.children[intentoActual];
  const cells = row.querySelectorAll(".wordle-cell");
  let palabraIntento = "";
  cells.forEach((cell) => (palabraIntento += cell.textContent));

  if (palabraIntento.length !== palabraCorrecta.length) {
    wordleMessage.textContent = `La palabra debe tener ${palabraCorrecta.length} letras.`;
    return;
  }

  // Contamos las apariciones de cada letra en la palabra correcta
  let conteoLetras = {};
  for (let letra of palabraCorrecta) {
    conteoLetras[letra] = (conteoLetras[letra] || 0) + 1;
  }

  // Paso 1: Marcar letras correctas (verde) y reducir su conteo
  for (let i = 0; i < palabraCorrecta.length; i++) {
    const cell = cells[i];
    const letra = cell.textContent;

    if (letra === palabraCorrecta[i]) {
      cell.classList.add("correct");
      conteoLetras[letra]--;
    }
  }

  // Paso 2: Marcar letras presentes pero en posición incorrecta (amarillo)
  for (let i = 0; i < palabraCorrecta.length; i++) {
    const cell = cells[i];
    const letra = cell.textContent;

    if (
      !cell.classList.contains("correct") &&
      palabraCorrecta.includes(letra) &&
      conteoLetras[letra] > 0
    ) {
      cell.classList.add("present");
      conteoLetras[letra]--;
    } else if (!cell.classList.contains("correct")) {
      cell.classList.add("absent");
    }
  }

  // Verificar si la palabra fue adivinada correctamente
  if (palabraIntento === palabraCorrecta) {
    const indice = palabras.findIndex((p) => p.palabra === palabraCorrecta);
    palabras.splice(indice, 1);
    racha++;

    // Mostrar mensaje con definición
    wordleMessage.innerHTML = `
      <div class="alert alert-success">
        <strong>¡Felicidades!</strong> Adivinaste la palabra.<br>
        Racha actual: ${racha}
      </div>
      <div class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">${palabraCorrecta}</h5>
          <p class="card-text">${definicionCorrecta}</p>
        </div>
      </div>
    `;

    finalizarJuego();
  } else {
    intentoActual++;
    if (intentoActual === intentos) {
      racha = 0;
      wordleMessage.innerHTML = `
        <div class="alert alert-danger">
          <strong>¡Oh no!</strong> La palabra era: ${palabraCorrecta}
        </div>
        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">${palabraCorrecta}</h5>
            <p class="card-text">${definicionCorrecta}</p>
          </div>
        </div>
      `;
      finalizarJuego();
    } else {
      wordleMessage.textContent = "";
    }
  }
}

function finalizarJuego() {
  document.removeEventListener("keydown", manejarEntrada);
  wordleReset.style.display = "block"; // Mostrar botón de reinicio
}

// Evento de reinicio
wordleReset.addEventListener("click", () => {
  inicializarJuego();
});

// Inicializar el juego al cargar la página
inicializarJuego();
