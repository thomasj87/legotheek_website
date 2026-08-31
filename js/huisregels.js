document.addEventListener("DOMContentLoaded", async () => {
  const rooster = document.getElementById("huisregels-rooster");
  if (!rooster) return;

  const res = await fetch("data/huisregels.json");
  const regels = await res.json();

  rooster.innerHTML = regels.map((r, i) => `
    <article class="kaart regel">
      <div class="regel-nummer">${i + 1}</div>
      <div class="kaart-lichaam">
        <h3>${r.titel}</h3>
        <p>${r.tekst}</p>
      </div>
    </article>
  `).join("");
});
