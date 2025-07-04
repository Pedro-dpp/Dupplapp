document.addEventListener("DOMContentLoaded", async () => {
  // Elementos del DOM
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const rulesSidebar = document.getElementById("rules-sidebar");
  const rulesAccordion = document.getElementById("rules-accordion");
  const rulesContent = document.getElementById("rules-content");

  // barra lateral en móvil
  sidebarToggle.addEventListener("click", () => {
    rulesSidebar.classList.toggle("active");
  });

  // Cargar reglas desde JSON
  try {
    const response = await fetch("../json/reglas.json");
    if (!response.ok) throw new Error("Error al cargar las reglas");
    const reglasData = await response.json();

    // Generar índice de reglas
    generateRulesIndex(reglasData);

    // Cargar contenido
    if (reglasData.secciones.length > 0) {
      loadRuleContent(reglasData.secciones[0], 0, reglasData.secciones);
    }
  } catch (error) {
    console.error("Error:", error);
    rulesContent.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle"></i> No se pudieron cargar las reglas. Por favor intenta más tarde.
      </div>
    `;
  }

  // Función para generar el índice
  function generateRulesIndex(data) {
    rulesAccordion.innerHTML = "";

    data.secciones.forEach((seccion, index) => {
      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";

      const accordionHeader = document.createElement("h2");
      accordionHeader.className = "accordion-header";
      accordionHeader.id = `heading-${index}`;

      const accordionButton = document.createElement("button");
      accordionButton.className = "accordion-button collapsed";
      accordionButton.type = "button";
      accordionButton.dataset.bsToggle = "collapse";
      accordionButton.dataset.bsTarget = `#collapse-${index}`;
      accordionButton.textContent = seccion.titulo;

      accordionHeader.appendChild(accordionButton);

      const accordionCollapse = document.createElement("div");
      accordionCollapse.className = "accordion-collapse collapse";
      accordionCollapse.id = `collapse-${index}`;
      accordionCollapse.dataset.bsParent = "#rules-accordion";

      const accordionBody = document.createElement("div");
      accordionBody.className = "accordion-body p-0";

      const subitemsList = document.createElement("div");
      subitemsList.className = "list-group list-group-flush";

      seccion.subsecciones.forEach((subseccion, subIndex) => {
        const subitem = document.createElement("a");
        subitem.href = "#";
        subitem.className = "list-group-item list-group-item-action";
        subitem.textContent = subseccion.titulo;
        subitem.dataset.sectionId = index;
        subitem.dataset.subsectionId = subIndex;

        subitem.addEventListener("click", (e) => {
          e.preventDefault();
          loadRuleContent(seccion, subIndex, data.secciones);
        });

        subitemsList.appendChild(subitem);
      });

      accordionBody.appendChild(subitemsList);
      accordionCollapse.appendChild(accordionBody);

      accordionItem.appendChild(accordionHeader);
      accordionItem.appendChild(accordionCollapse);

      rulesAccordion.appendChild(accordionItem);
    });
  }

  // Función para cargar el contenido de una regla
  function loadRuleContent(seccion, subsectionIndex = 0, seccionesData) {
    const subsection = seccion.subsecciones[subsectionIndex];
    const currentSectionIndex = seccionesData.findIndex(
      (s) => s.titulo === seccion.titulo
    );

    rulesContent.innerHTML = `
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 class="h4 mb-0">${seccion.titulo} - ${subsection.titulo}</h2>
          <div class="d-flex">
            ${
              subsectionIndex > 0
                ? `
              <button class="btn btn-sm btn-outline-light prev-subsection ms-2">
                <i class="fas fa-arrow-left"></i> Anterior
              </button>
            `
                : ""
            }
            ${
              subsectionIndex < seccion.subsecciones.length - 1
                ? `
              <button class="btn btn-sm btn-outline-light next-subsection ms-2">
                Siguiente <i class="fas fa-arrow-right"></i>
              </button>
            `
                : ""
            }
          </div>
        </div>
        <div class="card-body">
          ${subsection.contenido}
        </div>
        ${
          subsection.imagen
            ? `
          <div class="card-footer text-center">
            <img src="../${subsection.imagen}" class="img-fluid rounded" alt="${subsection.titulo}">
          </div>
        `
            : ""
        }
        
        <!-- Nuevos botones para navegar entre SECCIONES -->
        <div class="card-footer d-flex justify-content-between">
          ${
            currentSectionIndex > 0
              ? `
            <button class="btn btn-outline-primary prev-section">
              <i class="fas fa-arrow-left"></i> Anterior: ${
                seccionesData[currentSectionIndex - 1].titulo
              }
            </button>
          `
              : "<div></div>"
          }
          
          ${
            currentSectionIndex < seccionesData.length - 1
              ? `
            <button class="btn btn-outline-primary next-section">
              Siguiente: ${
                seccionesData[currentSectionIndex + 1].titulo
              } <i class="fas fa-arrow-right"></i>
            </button>
          `
              : ""
          }
        </div>
      </div>
    `;

    // Eventos para subsecciones
    document
      .querySelector(".prev-subsection")
      ?.addEventListener("click", () => {
        loadRuleContent(seccion, subsectionIndex - 1, seccionesData);
      });

    document
      .querySelector(".next-subsection")
      ?.addEventListener("click", () => {
        loadRuleContent(seccion, subsectionIndex + 1, seccionesData);
      });

    // Eventos para secciones principales
    document.querySelector(".prev-section")?.addEventListener("click", () => {
      const prevSection = seccionesData[currentSectionIndex - 1];
      loadRuleContent(prevSection, 0, seccionesData); // Siempre empieza en la primera subsección
    });

    document.querySelector(".next-section")?.addEventListener("click", () => {
      const nextSection = seccionesData[currentSectionIndex + 1];
      loadRuleContent(nextSection, 0, seccionesData); // Siempre empieza en la primera subsección
    });

    // Cerrar sidebar en móvil
    if (window.innerWidth < 992) {
      rulesSidebar.classList.remove("active");
    }
  }
});
