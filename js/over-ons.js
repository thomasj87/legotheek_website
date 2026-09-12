function kaartUrl(kaart) {
  const { lat, lon, zoom } = kaart;
  const dLon = (360 / Math.pow(2, zoom)) * 2;
  const dLat = dLon * Math.cos((lat * Math.PI) / 180);
  const bbox = [
    (lon - dLon / 2).toFixed(5),
    (lat + dLat / 2).toFixed(5),
    (lon + dLon / 2).toFixed(5),
    (lat - dLat / 2).toFixed(5)
  ].join("%2C");
  return (
    "https://www.openstreetmap.org/export/embed.html?" +
    "bbox=" + bbox +
    "&layer=mapnik" +
    "&marker=" + lat.toFixed(5) + "%2C" + lon.toFixed(5)
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const doel = document.getElementById("over-ons-inhoud");
  if (!doel) return;

  const res = await fetch("data/over-ons.json");
  const data = await res.json();

  const verhaal = data.verhaal.map((par) => `<p>${par}</p>`).join("");
  const tijden = (data.ophaalTijden || [])
    .map((t) => `<li>${t}</li>`)
    .join("");

  doel.innerHTML = `
    <img class="over-ons-foto" src="${data.foto}" alt="Lise en Cas, de kinderen van de legotheek">
    <div class="over-ons-grid">
      <div class="over-ons-tekst">
        <div class="over-ons-verhaal">${verhaal}</div>
        <h2>Waar en wanneer?</h2>
        <p class="over-ons-adres">${data.adres}</p>
        <h3>Ophaaltijden</h3>
        <ul class="ophaal-tijden">${tijden}</ul>
      </div>
      <div class="over-ons-kaart">
        <iframe
          src="${kaartUrl(data.kaart)}"
          loading="lazy"
          title="Kaart met onze benaderde locatie"
        ></iframe>
        <p class="kaart-opschrift">Benaderde locatie — spreek het exacte moment af via het reserveringsformulier.</p>
      </div>
    </div>
  `;
});
