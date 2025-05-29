document.addEventListener("DOMContentLoaded", () => {
  // Cargar imágenes del carrusel
  const carouselInner = document.getElementById("carousel-inner");
  const folder = "../media";
  let index = 1;

  function tryLoadNextImage() {
    const img = new Image();
    img.src = `${folder}/${index}.jpg`;

    img.onload = () => {
      const div = document.createElement("div");
      div.className = "carousel-item" + (index === 1 ? " active" : "");
      div.innerHTML = `<img src="${img.src}" class="d-block w-100" alt="Torneo ${index}" style="max-height: 70vh; object-fit: contain;">`;
      carouselInner.appendChild(div);
      index++;
      tryLoadNextImage();
    };

    img.onerror = () => {
      console.log(
        "Se cargaron",
        index - 1,
        "imágenes. El carrusel es circular por defecto."
      );
    };
  }

  tryLoadNextImage();

  // Configurar botones para abrir modales
  document.getElementById("btnSuscripcion").addEventListener("click", () => {
    const modal = new bootstrap.Modal(
      document.getElementById("modalSuscripcion")
    );
    modal.show();
  });

  document.getElementById("btnGaleria").addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("modalGaleria"));
    modal.show();
  });
});
