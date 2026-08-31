document.addEventListener("DOMContentLoaded", async () => {
  const rooster = document.getElementById("sets-rooster");
  if (!rooster) return;

  const res = await fetch("data/sets.json");
  const sets = await res.json();

  rooster.innerHTML = sets.map((s) => `
    <article class="kaart">
      <a href="set.html?id=${s.id}"><img src="${s.fotos[0].pad}" alt="${s.naam}"></a>
      <div class="kaart-lichaam">
        <span class="set-nummer">Set ${s.nummer}</span>
        <h3><a href="set.html?id=${s.id}">${s.naam}</a></h3>
        <p>${s.beschrijving}</p>
        <span class="prijs">€ ${s.prijs}</span>
        <a class="knop knop-rood" href="reserveren.html?set=${s.id}">Reserveren</a>
      </div>
    </article>
  `).join("");
});
