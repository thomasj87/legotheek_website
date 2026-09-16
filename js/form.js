document.addEventListener("DOMContentLoaded", async () => {
  const formulier = document.getElementById("reserveringsformulier");
  if (!formulier) return;

  const setSelect = document.getElementById("set");
  const res = await fetch("data/sets.json");
  const sets = LEGOOTHEEK.gereleased(await res.json());
  setSelect.innerHTML = sets
    .map((s) => `<option value="${s.id}">Set ${s.nummer} — ${s.naam} (€ ${s.prijs})</option>`)
    .join("");

  const gekozen = new URLSearchParams(location.search).get("set");
  if (gekozen && sets.some((s) => s.id === gekozen)) {
    setSelect.value = gekozen;
  }

  const datumVeld = document.getElementById("datum");
  datumVeld.min = new Date().toISOString().split("T")[0];

  const melding = document.getElementById("form-melding");

  formulier.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      naam: formulier.naam.value,
      email: formulier.email.value,
      set: setSelect.options[setSelect.selectedIndex].text,
      datum: datumVeld.value,
      bericht: formulier.bericht.value
    };
    melding.textContent = "";
    melding.className = "melding";

    if (CONFIG.reserverenEndpoint) {
      try {
        const res = await fetch(CONFIG.reserverenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        melding.textContent = "Bedankt! Je reservering is verstuurd. We mailen je snel terug.";
        melding.className = "melding succes";
        formulier.reset();
      } catch {
        melding.textContent =
          "Oeps, het is niet gelukt. Stuur ons dan even een e-mail op " +
          CONFIG.reserverenEmail + ".";
        melding.className = "melding fout";
      }
    } else {
      const onderwerp = encodeURIComponent("Reservering: " + data.set);
      const lichaam = encodeURIComponent(
        "Naam: " + data.naam + "\n" +
        "E-mail: " + data.email + "\n" +
        "Set: " + data.set + "\n" +
        "Gewenste datum: " + data.datum + "\n" +
        "Bericht: " + data.bericht
      );
      location.href =
        "mailto:" + CONFIG.reserverenEmail +
        "?subject=" + onderwerp + "&body=" + lichaam;
      melding.textContent =
        "Je e-mailprogramma is open. Verstuur de e-mail om je reservering af te ronden.";
      melding.className = "melding succes";
    }
  });
});
