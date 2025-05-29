document.addEventListener("DOMContentLoaded", async () => {
  // Cargar el JSON de FAQs
  let faqs = [];

  try {
    const response = await fetch("../json/faqs.json");
    if (!response.ok) throw new Error("Error al cargar FAQs");
    faqs = await response.json();
  } catch (error) {
    console.error("Error:", error);
    const accordion = document.getElementById("faq-accordion");
    accordion.innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i> No se pudieron cargar las preguntas frecuentes. Por favor intenta más tarde.
          </div>
        `;
    return;
  }

  // Función para renderizar FAQs
  function renderFAQs(filteredFaqs = faqs) {
    const accordion = document.getElementById("faq-accordion");
    const noResults = document.getElementById("no-results");

    if (filteredFaqs.length === 0) {
      accordion.innerHTML = "";
      noResults.style.display = "block";
      return;
    }

    noResults.style.display = "none";

    accordion.innerHTML = filteredFaqs
      .map(
        (faq, index) => `
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading-${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
                ${faq.pregunta}
              </button>
            </h2>
            <div id="collapse-${index}" class="accordion-collapse collapse" 
              aria-labelledby="heading-${index}" data-bs-parent="#faq-accordion">
              <div class="accordion-body">
                ${faq.respuesta}
                ${
                  faq.link
                    ? ` <a href="${faq.link}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">Más información</a>`
                    : ""
                }
              </div>
            </div>
          </div>
        `
      )
      .join("");
  }

  // Renderizar todas las FAQs al cargar
  renderFAQs();

  // Buscador de FAQs
  document.getElementById("faq-search").addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length < 2) {
      renderFAQs(faqs);
      return;
    }

    const filtered = faqs.filter(
      (faq) =>
        faq.pregunta.toLowerCase().includes(searchTerm) ||
        faq.respuesta.toLowerCase().includes(searchTerm) ||
        (faq.tags &&
          faq.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    );

    renderFAQs(filtered);
  });

  // Botón limpiar búsqueda
  document.getElementById("clear-search").addEventListener("click", () => {
    document.getElementById("faq-search").value = "";
    renderFAQs(faqs);
  });
});
