document.addEventListener("DOMContentLoaded", async () => {
  const rooster = document.getElementById("sets-rooster");
  if (!rooster) return;

  const res = await fetch("data/sets.json");
  const sets = LEGOOTHEEK.gereleased(await res.json());

  if (!sets.length) {
    rooster.innerHTML =
      '<p class="rooster-leeg">Er zijn momenteel nog geen sets gereleased. Blijf ' +
      "kijken — de sets verschijnen zodra ze gereleased zijn!</p>";
    return;
  }

  rooster.innerHTML = sets.map((s) => {
    const hoofdfoto = (s.fotos && s.fotos.length) ? s.fotos[0].pad : "img/sets/placeholder.svg";
    return `
    <article class="kaart">
      <a href="set.html?id=${s.id}"><img src="${hoofdfoto}" alt="${s.naam}"></a>
      <div class="kaart-lichaam">
        <span class="thema-badge thema-${s.thema.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${s.thema}</span>
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
