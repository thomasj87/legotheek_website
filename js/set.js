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

  const fotos = set.fotos || [];

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

  detail.innerHTML = `
    <a class="set-terug" href="sets.html">← Terug naar alle sets</a>
    <div class="set-grid">
      <div>
        ${fotos.length ? renderFoto(fotos[0], 0, "set-foto-kaart") : ""}
        ${fotos.length > 1
          ? `<div class="set-extra-fotos">${fotos.slice(1).map((f, i) => renderFoto(f, i + 1, "set-extra-foto")).join("")}</div>`
          : ""}
      </div>
      <div class="set-info">
        <span class="set-nummer">Set ${set.nummer}</span>
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
