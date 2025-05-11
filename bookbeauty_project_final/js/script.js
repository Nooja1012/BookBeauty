// Ændr titlen dynamisk på ledige_tider.html
function updateLedigeTiderTitel() {
    const title = document.getElementById("times-title");
    if (!title) return;
  
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
  
    if (type === "afbud") {
      title.textContent = "Ledige afbudstider";
    } else {
      title.textContent = "Ledige tider";
    }
  }
  
  // Håndter annulleringsformularen
  function sendAnnullering(event) {
    event.preventDefault();
    alert("Din annullering er sendt.");
    window.location.href = "vaelg_behandler.html"; // eller "../views/vaelg_behandler.html"
  }
  
  // Kør relevante funktioner når siden loader
  document.addEventListener("DOMContentLoaded", () => {
    updateLedigeTiderTitel(); // Kører kun hvis elementet findes
  });
  