// Objektorienteret brugerklasse (bruger e-mail som ID)
class User {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  // Gemmer brugeren i localStorage
  save() {
    localStorage.setItem(this.email, JSON.stringify(this));
  }

  // Tjekker om e-mail og kodeord matcher
  static login(email, password) {
    const data = localStorage.getItem(email);
    if (!data) return false;

    const user = JSON.parse(data);
    return user.password === password;
  }
}

// Signup funktion
function signupUser(event) {
  event.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  if (localStorage.getItem(email)) {
    alert("Der findes allerede en bruger med denne e-mail.");
    return;
  }

  const newUser = new User(email, password);
  newUser.save();

  alert("Bruger oprettet! Du kan nu logge ind.");
  window.location.href = "login.html";
}

// Login funktion
function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const success = User.login(email, password);

  if (success) {
    alert("Login succesfuldt!");
    window.location.href = "vaelg_behandler.html";
  } else {
    alert("Forkert e-mail eller kodeord.");
  }
}


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
  window.location.href = "vaelg_behandler.html";
}

// Kør relevant funktion ved sideindlæsning
document.addEventListener("DOMContentLoaded", () => {
  updateLedigeTiderTitel();
});
