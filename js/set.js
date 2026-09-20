document.addEventListener("DOMContentLoaded", async () => {
  const detail = document.getElementById("set-detail");
  if (!detail) return;

  const params = new URLSearchParams(location.search);
  const res = await fetch("data/sets.json");
  const sets = await res.json();
  const set =
    sets.find((s) => s.id === params.get("id")) ||
    sets.find((s) => String(s.nummer) === params.get("nummer")) ||
    sets[0];

  const fotos = (set.fotos || []).filter(Boolean);
  const origineel = set.origineleSets || [];

  if (set.publicatieDatum && !LEGOOTHEEK.isReleased(set)) {
    detail.innerHTML = `
      <a class="set-terug" href="sets.html">← Terug naar alle sets</a>
      <div class="set-info">
        <h1>Deze set is nog niet gereleased</h1>
        <p class="set-omschrijving">Deze set verschijnt op de site op
          ${new Date(set.publicatieDatum + "T00:00:00").toLocaleDateString("nl-NL")}.
          Kom gerust terug dan!</p>
      </div>`;
    document.title = "Set nog niet gereleased — Legotheek";
    return;
  }

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

  function renderFoto(f, i, klasse) {
    const alt = f.onderschrift || set.naam;
    return `
      <figure class="${klasse}">
        <button class="foto-knop" type="button" data-foto="${i}"
          aria-label="Foto ${i + 1} van ${fotos.length} in groot bekijken">
          <img src="${f.pad}" alt="${alt}" ${i === 0 ? "" : 'loading="lazy"'}>
        </button>
        ${f.onderschrift ? `<figcaption>${f.onderschrift}</figcaption>` : ""}
      </figure>`;
  }

  const fotoBlok = fotos.length
    ? `${renderFoto(fotos[0], 0, "set-foto-kaart")}
       ${fotos.length > 1
         ? `<div class="set-extra-fotos">${fotos.slice(1).map((f, i) => renderFoto(f, i + 1, "set-extra-foto")).join("")}</div>`
         : ""}`
    : `<figure class="set-foto-kaart">
         <img src="img/sets/placeholder.svg" alt="${set.naam}">
         <figcaption>Foto's van deze set volgen binnenkort!</figcaption>
       </figure>`;

  const setjesBlok = origineel.length ? `
    <h2 class="setjes-koptekst">Bestaat uit ${origineel.length === 1 ? "een originele Lego-set" : origineel.length + " originele Lego-setjes"}</h2>
    <table class="setjes-tabel">
      <thead>
        <tr><th>Lego-set</th><th>Setnummer</th><th>Stenen</th></tr>
      </thead>
      <tbody>
        ${origineel.map((o) => `
          <tr>
            <td>${o.naam}</td>
            <td class="setjes-nummer">${o.nummer}</td>
            <td class="setjes-stukken">${o.stukken}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <p class="setjes-totaal">Totaal: ${set.delen} steentjes</p>`
  : "";

  detail.innerHTML = `
    <a class="set-terug" href="sets.html">← Terug naar alle sets</a>
    <div class="set-grid">
      <div>${fotoBlok}</div>
      <div class="set-info">
        <div class="set-info-rij">
          <span class="set-nummer">Set ${set.nummer}</span>
          <span class="thema-badge thema-${set.thema.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${set.thema}</span>
        </div>
        <h1>${set.naam}</h1>
        <span class="prijs">€ ${set.prijs}</span>
        <ul class="specificaties">
          <li>Aantal steentjes: ${set.delen}</li>
        </ul>
        <p class="set-omschrijving">${set.omschrijving || set.beschrijving}</p>
        ${setjesBlok}
        ${video}
        <a class="knop knop-rood" href="reserveren.html?set=${set.id}">Reserveren</a>
      </div>
    </div>
    <div class="lightbox" id="lightbox" hidden>
      <span class="lightbox-teller" id="lightbox-teller"></span>
      <button class="lightbox-sluiten" type="button" aria-label="Sluiten">×</button>
      <button class="lightbox-voor" type="button" aria-label="Vorige foto">‹</button>
      <figure>
        <img id="lightbox-img" src="" alt="">
        <figcaption id="lightbox-onderschrift"></figcaption>
      </figure>
      <button class="lightbox-na" type="button" aria-label="Volgende foto">›</button>
    </div>
  `;
  document.title = `Set ${set.nummer}: ${set.naam} — Legotheek`;

  if (!fotos.length) return;

  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbOnderschrift = document.getElementById("lightbox-onderschrift");
  const lbTeller = document.getElementById("lightbox-teller");
  let lbIndex = 0;

  function lbToon(i) {
    lbIndex = (i + fotos.length) % fotos.length;
    const f = fotos[lbIndex];
    lbImg.src = f.pad;
    lbImg.alt = f.onderschrift || set.naam;
    lbOnderschrift.textContent = f.onderschrift || "";
    lbOnderschrift.hidden = !f.onderschrift;
    lbTeller.textContent = (lbIndex + 1) + " / " + fotos.length;
    const volgende = fotos[(lbIndex + 1) % fotos.length];
    if (volgende) new Image().src = volgende.pad;
  }

  function lbOpen(i) {
    lbToon(i);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
  }

  function lbSluit() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
  }

  detail.querySelectorAll(".foto-knop").forEach((knop) => {
    knop.addEventListener("click", () => lbOpen(Number(knop.dataset.foto)));
  });
  detail.querySelector(".lightbox-sluiten").addEventListener("click", lbSluit);
  detail.querySelector(".lightbox-voor").addEventListener("click", (e) => {
    e.stopPropagation();
    lbToon(lbIndex - 1);
  });
  detail.querySelector(".lightbox-na").addEventListener("click", (e) => {
    e.stopPropagation();
    lbToon(lbIndex + 1);
  });
  lbImg.addEventListener("click", () => lbToon(lbIndex + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lbSluit();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") lbSluit();
    if (e.key === "ArrowRight") lbToon(lbIndex + 1);
    if (e.key === "ArrowLeft") lbToon(lbIndex - 1);
  });
});
