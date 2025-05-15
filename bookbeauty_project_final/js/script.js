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

// === SIGNUP & LOGIN ===

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

// === BOOKING FLOW ===

function displayTimes() {
  const container = document.getElementById("times-list");
  if (!container) return;
  const times = JSON.parse(localStorage.getItem("availableTimes") || "[]");
  container.innerHTML = times.map(t => `<div class="time-slot">${t}</div>`).join("");
}

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

function vælgTidOgGåTilBehandling(tid) {
  localStorage.setItem("valgtTid", tid);
  window.location.href = "behandler_info.html";
}

function vælgBehandling(navn) {
  const tid = localStorage.getItem("valgtTid");
  if (!tid) {
    alert("Ingen tid valgt. Gå tilbage og vælg en tid først.");
    window.location.href = "ledige_tider.html";
    return;
  }

  const samlet = `${tid} – ${navn}`;
  let mine = JSON.parse(localStorage.getItem("mineBookinger") || "[]");
  mine.push(samlet);
  localStorage.setItem("mineBookinger", JSON.stringify(mine));

  let available = JSON.parse(localStorage.getItem("availableTimes") || "[]");
  available = available.filter(t => t !== tid);
  localStorage.setItem("availableTimes", JSON.stringify(available));

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

function visBekraeftetTid() {
  const container = document.getElementById("booking-details");
  if (!container) return;
  const tid = localStorage.getItem("sidstBooket");
  if (tid) {
    container.innerHTML = `<p>Din bookede tid: <strong>${tid}</strong></p>`;
  }
}

// === TIDSTILFØJELSE FOR ADMIN ===

function opretTidsintervaller() {
  const select = document.getElementById("ny-tidspunkt");
  if (!select) return;
  select.innerHTML = "";

  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 5) {
      const tid = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const option = document.createElement("option");
      option.value = tid;
      option.textContent = tid;
      select.appendChild(option);
    }
  }
}

function gemNyTidDropdown() {
  const dato = document.getElementById("ny-dato").value;
  const tidspunkt = document.getElementById("ny-tidspunkt").value;
  const varighed = parseInt(document.getElementById("tid-varighed").value, 10);

  if (!dato || !tidspunkt || !varighed) {
    alert("Udfyld alle felter");
    return;
  }

  const start = new Date(`${dato}T${tidspunkt}`);
  const slut = new Date(start.getTime() + varighed * 60000);

  const formatter = new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });

  const startStr = formatter.format(start);
  const slutStr = slut.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  const visning = `${startStr} - ${slutStr}`;

  let tider = JSON.parse(localStorage.getItem("availableTimes") || "[]");
  tider.push(visning);
  localStorage.setItem("availableTimes", JSON.stringify(tider));

  displayTimes();
  document.getElementById("ny-dato").value = "";
}

// === ADMIN: VIS BOOKINGER ===

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

// === LOG UD ===

function logout() {
  alert("Du er nu logget ud.");
  window.location.href = "login.html";
}

// === INIT ===

document.addEventListener("DOMContentLoaded", () => {
  if (typeof displayTimes === "function") displayTimes();
  if (typeof visBekraeftetTid === "function") visBekraeftetTid();
  visBookingerForVirksomhed();
  opretTidsintervaller();
});
