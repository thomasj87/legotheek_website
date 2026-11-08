document.addEventListener("DOMContentLoaded", async () => {
  const formulier = document.getElementById("reserveringsformulier");
  if (!formulier) return;

  const datumVeld = document.getElementById("datum");
  const basisMinDatum = LEGOOTHEEK.minReserveringsDatum ? LEGOOTHEEK.minReserveringsDatum() : (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  })();

  if (datumVeld) {
    datumVeld.min = basisMinDatum;
  }

  const setSelect = document.getElementById("set");
  let sets = [];
  try {
    const res = await fetch("data/sets.json");
    sets = await res.json();
    setSelect.innerHTML = sets
      .map((s) => {
        const isReleased = LEGOOTHEEK.isReleased(s);
        const extra = !isReleased ? ` (vanaf ${LEGOOTHEEK.formatDatum(s.publicatieDatum)})` : "";
        return `<option value="${s.id}">Set ${s.nummer} — ${s.naam} (€ ${s.prijs})${extra}</option>`;
      })
      .join("");

    const gekozen = new URLSearchParams(location.search).get("set");
    if (gekozen && sets.some((s) => s.id === gekozen)) {
      setSelect.value = gekozen;
    }
  } catch (err) {
    console.error("Fout bij het laden van sets:", err);
  }

  function updateDatumMin() {
    if (!datumVeld) return;
    const gekozenSet = sets.find((s) => s.id === setSelect.value);
    const minDatum = (gekozenSet && gekozenSet.publicatieDatum && gekozenSet.publicatieDatum > basisMinDatum)
      ? gekozenSet.publicatieDatum
      : basisMinDatum;
    datumVeld.min = minDatum;
    if (datumVeld.value && datumVeld.value < minDatum) {
      datumVeld.value = minDatum;
    }
  }

  updateDatumMin();
  setSelect.addEventListener("change", updateDatumMin);

  const melding = document.getElementById("form-melding");
  const knop = formulier.querySelector('button[type="submit"]');

  const mailtoLink = (data) =>
    "mailto:" + CONFIG.reserverenEmail +
    "?subject=" + encodeURIComponent("Reservering: " + data.set) +
    "&body=" + encodeURIComponent(
      "Naam: " + data.naam + "\n" +
      "E-mail: " + data.email + "\n" +
      "Set: " + data.set + "\n" +
      "Gewenste datum: " + data.datum + "\n" +
      "Bericht: " + data.bericht
    );

  formulier.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (datumVeld.value && datumVeld.min && datumVeld.value < datumVeld.min) {
      const minTekst = LEGOOTHEEK.formatDatum ? LEGOOTHEEK.formatDatum(datumVeld.min) : datumVeld.min;
      melding.textContent = `Kies een datum vanaf ${minTekst} (minimaal 2 dagen van tevoren reserveren).`;
      melding.className = "melding fout";
      datumVeld.focus();
      return;
    }
    const data = {
      naam: formulier.naam.value,
      email: formulier.email.value,
      set: setSelect.options[setSelect.selectedIndex].text,
      datum: datumVeld.value,
      bericht: formulier.bericht.value
    };
    // Honeypot: bots vullen het onzichtbare veld in -> we versturen dan niks.
    if (formulier.website.value) return;

    melding.textContent = "";
    melding.className = "melding";
    knop.disabled = true;
    knop.textContent = "Versturen...";

    if (CONFIG.emailJs.publicKey) {
      try {
        const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: CONFIG.emailJs.serviceId,
            template_id: CONFIG.emailJs.templateId,
            user_id: CONFIG.emailJs.publicKey,
            template_params: data
          })
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        melding.textContent = "Bedankt! Je reservering is verstuurd. We mailen je snel terug.";
        melding.className = "melding succes";
        formulier.reset();
      } catch {
        melding.textContent =
          "Oeps, het is niet gelukt. Stuur ons dan even een e-mail op ";
        const link = document.createElement("a");
        link.href = mailtoLink(data);
        link.textContent = CONFIG.reserverenEmail;
        melding.appendChild(link);
        melding.appendChild(document.createTextNode("."));
        melding.className = "melding fout";
      }
    } else {
      location.href = mailtoLink(data);
      melding.textContent =
        "Je e-mailprogramma is geopend. Verstuur het bericht om je reservering af te ronden.";
      melding.className = "melding succes";
    }
    knop.disabled = false;
    knop.textContent = "Verstuur reservering";
  });
});
