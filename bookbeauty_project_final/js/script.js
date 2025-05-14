class User {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.type = "customer";
  }

  save() {
    localStorage.setItem(this.email, JSON.stringify(this));
  }
}

class Business {
  constructor(email, password, cvr) {
    this.email = email;
    this.password = password;
    this.cvr = cvr;
    this.type = "business";
  }

  save() {
    localStorage.setItem(this.email, JSON.stringify(this));
  }
}

// Signup for kunde
function signupUser(event) {
  event.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  if (localStorage.getItem(email)) {
    alert("Bruger findes allerede");
    return;
  }
  const user = new User(email, password);
  user.save();
  alert("Bruger oprettet!");
  window.location.href = "login.html";
}

// Signup for erhvervsbruger
function signupBusiness(event) {
  event.preventDefault();
  const email = document.getElementById("business-email").value;
  const password = document.getElementById("business-password").value;
  const cvr = document.getElementById("business-cvr").value;
  if (!/^\d{8}$/.test(cvr)) {
    alert("CVR skal være 8 cifre");
    return;
  }
  if (localStorage.getItem(email)) {
    alert("Bruger findes allerede");
    return;
  }
  const business = new Business(email, password, cvr);
  business.save();
  alert("Erhvervsbruger oprettet!");
  window.location.href = "login.html";
}

// Login
function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const data = localStorage.getItem(email);
  if (!data) return alert("Bruger ikke fundet");

  const user = JSON.parse(data);
  if (user.password !== password) return alert("Forkert kodeord");

  if (user.type === "business") {
    window.location.href = "admin_home.html";
  } else {
    window.location.href = "vaelg_behandler.html";
  }
}

// Vis tider for erhvervsbruger
function displayTimes() {
  const container = document.getElementById("times-list");
  if (!container) return;
  const times = JSON.parse(localStorage.getItem("availableTimes") || "[]");
  container.innerHTML = times.map(t => `<div class="time-slot">${t}</div>`).join("");
}

// Opdater ledige tider på kunden-side
function updateLedigeTiderTitel() {
  const title = document.getElementById("times-title");
  const section = document.getElementById("times-section");
  if (!title || !section) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  const dataKey = type === "afbud" ? "afbudTimes" : "availableTimes";
  title.textContent = type === "afbud" ? "Ledige afbudstider" : "Ledige tider";

  const times = JSON.parse(localStorage.getItem(dataKey) || "[]");
  section.innerHTML = times.length
    ? times.map(t => `<div class="time-slot" onclick="vælgTidOgGåTilBehandling('${t}')">${t}</div>`).join("")
    : "<p style='text-align:center;'>Ingen tider tilgængelige</p>";
}

// Vælg tid og gå til behandling
function vælgTidOgGåTilBehandling(tid) {
  localStorage.setItem("valgtTid", tid);
  window.location.href = "behandler_info.html";
}

// Vælg behandling og gem booking (kunde + admin)
function vælgBehandling(navn) {
  const tid = localStorage.getItem("valgtTid");
  if (!tid) {
    alert("Ingen tid valgt. Gå tilbage og vælg en tid først.");
    window.location.href = "ledige_tider.html";
    return;
  }

  const samlet = `${tid} – ${navn}`;

  // Gem i brugerens egne bookinger
  let mine = JSON.parse(localStorage.getItem("mineBookinger") || "[]");
  mine.push(samlet);
  localStorage.setItem("mineBookinger", JSON.stringify(mine));

  // Fjern fra ledige tider
  let available = JSON.parse(localStorage.getItem("availableTimes") || "[]");
  available = available.filter(t => t !== tid);
  localStorage.setItem("availableTimes", JSON.stringify(available));

  // Gem i global booking-liste til admin
  let allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  allBookings.push({
    virksomhed: "PureSkin",
    tidspunkt: tid,
    behandling: navn
  });
  localStorage.setItem("bookings", JSON.stringify(allBookings));

  localStorage.removeItem("valgtTid");
  localStorage.setItem("sidstBooket", samlet);
  window.location.href = "booking_bekraeftelse.html";
}

// Vis booket tid på bekræftelsesside
function visBekraeftetTid() {
  const container = document.getElementById("booking-details");
  if (!container) return;
  const tid = localStorage.getItem("sidstBooket");
  if (tid) {
    container.innerHTML = `<p>Din bookede tid: <strong>${tid}</strong></p>`;
  }
}

// Gem ny tid som erhvervsbruger via kalenderinput
function gemNyTid() {
  const input = document.getElementById("ny-tid");
  if (!input || !input.value) return alert("Vælg dato og tidspunkt.");

  const val = new Date(input.value);
  const formatted = val.toLocaleString("da-DK", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit"
  });

  let tider = JSON.parse(localStorage.getItem("availableTimes") || "[]");
  tider.push(formatted);
  localStorage.setItem("availableTimes", JSON.stringify(tider));
  displayTimes();
  input.value = "";
}

// Vis alle bookinger for admin (PureSkin)
function visBookingerForVirksomhed() {
  const container = document.getElementById("bookings-output");
  if (!container) return;

  const alle = JSON.parse(localStorage.getItem("bookings") || "[]");
  const mine = alle.filter(b => b.virksomhed === "PureSkin");

  if (mine.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>Ingen bookinger endnu.</p>";
    return;
  }

  container.innerHTML = mine.map(b =>
    `<div class="booking-item"><strong>${b.tidspunkt}</strong><br>${b.behandling}</div>`
  ).join("");
}

// Gammel annuller_tid.html (bruges ikke længere)
function sendAnnullering(event) {
  event.preventDefault();
  const dato = document.getElementById("dato")?.value;
  if (!dato) {
    alert("Vælg en dato");
    return;
  }

  let booked = JSON.parse(localStorage.getItem("bookedTimes") || "[]");
  const match = booked.find(t => t.includes(dato));
  if (!match) {
    alert("Ingen booking fundet på denne dato");
    return;
  }

  booked = booked.filter(t => !t.includes(dato));
  localStorage.setItem("bookedTimes", JSON.stringify(booked));

  const afbud = JSON.parse(localStorage.getItem("afbudTimes") || "[]");
  afbud.push(match.split(" – ")[0]);
  localStorage.setItem("afbudTimes", JSON.stringify(afbud));

  alert("Din tid er annulleret og gjort tilgængelig som afbudstid.");
  window.location.href = "vaelg_behandler.html";
}

// Log ud
function logout() {
  alert("Du er nu logget ud.");
  window.location.href = "login.html";
}

// Init ved indlæsning
document.addEventListener("DOMContentLoaded", () => {
  if (typeof displayTimes === "function") displayTimes();
  if (typeof visBekraeftetTid === "function") visBekraeftetTid();
  visBookingerForVirksomhed();
});
