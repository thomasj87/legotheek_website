document.addEventListener("DOMContentLoaded", async () => {
  const rooster = document.getElementById("sets-rooster");
  if (!rooster) return;

  const res = await fetch("data/sets.json");
  const sets = await res.json();

  if (!sets.length) {
    rooster.innerHTML =
      '<p class="rooster-leeg">Er zijn momenteel nog geen sets beschikbaar. Kom snel ' +
      "terug — nieuwe sets verschijnen hier vanzelf!</p>";
    return;
  }

  rooster.innerHTML = sets.map((s) => {
    const hoofdfoto = (s.fotos && s.fotos.length) ? s.fotos[0].pad : "img/sets/placeholder.svg";
    const isReleased = LEGOOTHEEK.isReleased(s);
    const datumTekst = LEGOOTHEEK.formatDatum(s.publicatieDatum);
    const fotoBadge = !isReleased
      ? `<span class="badge-binnenkort-foto">Vanaf ${datumTekst}</span>`
      : "";

    return `
    <article class="kaart ${!isReleased ? "kaart-binnenkort" : ""}">
      <a href="set.html?id=${s.id}">
        <div class="kaart-foto-wrap">
          <img src="${hoofdfoto}" alt="${s.naam}">
          ${fotoBadge}
        </div>
      </a>
      <div class="kaart-lichaam">
        <div class="kaart-badges">
          <span class="thema-badge thema-${s.thema.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${s.thema}</span>
          ${!isReleased ? `<span class="badge-binnenkort">Binnenkort</span>` : ""}
        </div>
        <h3><a href="set.html?id=${s.id}">${s.naam}</a></h3>
        <p>${s.beschrijving}</p>
        <div class="kaart-rij">
          <span class="set-nummer">Set ${s.nummer}</span>
          <span class="prijs">€ ${s.prijs}</span>
        </div>
        <a class="knop knop-rood" href="reserveren.html?set=${s.id}">Reserveren</a>
      </div>
    </article>
  `;
  }).join("");
});
