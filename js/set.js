document.addEventListener("DOMContentLoaded", async () => {
  const detail = document.getElementById("set-detail");
  if (!detail) return;

  const id = new URLSearchParams(location.search).get("id");
  const res = await fetch("data/sets.json");
  const sets = await res.json();
  const set = sets.find((s) => s.id === id) || sets[0];

  const extraFotos = (set.extraFotos || [])
    .map((f) => `<img src="${f}" alt="${set.naam}">`)
    .join("");

  function youtubeEmbedUrl(url) {
    const v = url.match(/[?&]v=([\w-]+)/);
    if (v) return "https://www.youtube.com/embed/" + v[1];
    const short = url.match(/youtu\.be\/([\w-]+)/);
    if (short) return "https://www.youtube.com/embed/" + short[1];
    return url;
  }

  let video = "";
  if (set.video) {
    if (set.video.includes("youtube.com") || set.video.includes("youtu.be")) {
      video = `<div class="set-video"><iframe src="${youtubeEmbedUrl(set.video)}" frameborder="0" allowfullscreen></iframe></div>`;
    } else {
      video = `<div class="set-video"><video src="${set.video}" controls></video></div>`;
    }
  }

  detail.innerHTML = `
    <a class="set-terug" href="sets.html">← Terug naar alle sets</a>
    <div class="set-grid">
      <div>
        <div class="set-foto-kaart">
          <img src="${set.foto}" alt="${set.naam}">
        </div>
        ${extraFotos ? `<div class="set-extra-fotos">${extraFotos}</div>` : ""}
      </div>
      <div class="set-info">
        <h1>${set.naam}</h1>
        <span class="prijs">€ ${set.prijs}</span>
        <ul class="specificaties">
          <li>Aantal steentjes: ${set.delen}</li>
        </ul>
        <p class="set-omschrijving">${set.omschrijving || set.beschrijving}</p>
        ${video}
        <a class="knop knop-rood" href="reserveren.html?set=${set.id}">Reserveren</a>
      </div>
    </div>
  `;
  document.title = set.naam + " — Legotheek";
});
