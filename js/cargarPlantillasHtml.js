// Función para cargar una plantilla HTML en un elemento
async function loadTemplate(templatePath, elementId) {
  try {
    const response = await fetch(templatePath); // Cargar la plantilla
    if (!response.ok) {
      throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
    }
    const templateHTML = await response.text(); // Obtener el contenido HTML
    document.getElementById(elementId).innerHTML = templateHTML; // Insertar en el elemento

    // Llamar a la función para marcar el enlace activo
    if (elementId === "navbar-container") {
      setActiveNavLink();
    }
  } catch (error) {
    console.error(error);
  }
}

// Función para marcar el enlace activo en el navbar
function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop(); // Obtener la página actual
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link"); // Seleccionar todos los enlaces

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop(); // Obtener la página del enlace
    if (linkPage === currentPage) {
      link.classList.add("active"); // Agregar la clase "active" al enlace correspondiente
    } else {
      link.classList.remove("active"); // Eliminar la clase "active" de los demás enlaces
    }
  });
}

// Cargar el navbar y el footer antes de mostrar la página
async function loadPage() {
  await loadTemplate("../plantillas/navbar.html", "navbar-container"); // Cargar navbar
  await loadTemplate("../plantillas/footer.html", "footer-container"); // Cargar footer
  document.body.classList.add("ready"); // Mostrar la página
}

// Iniciar la carga de la página
document.addEventListener("DOMContentLoaded", loadPage);
