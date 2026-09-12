async function laadPosts() {
  const res = await fetch("data/posts.json");
  return res.json();
}

function formatDatum(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function postKaart(p) {
  return `
    <a class="kaart" href="post.html?id=${p.id}">
      <img src="${p.afbeelding}" alt="${p.titel}">
      <div class="kaart-lichaam">
        <span class="datum">${formatDatum(p.datum)}</span>
        <h3>${p.titel}</h3>
      </div>
    </a>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const lijst = document.getElementById("blog-lijst");
  const laatste = document.getElementById("laatste-post");
  const inhoud = document.getElementById("post-inhoud");
  if (!lijst && !laatste && !inhoud) return;

  const posts = await laadPosts();

  if (lijst) {
    lijst.innerHTML = posts.map(postKaart).join("");
  }

  if (laatste && posts.length > 0) {
    laatste.innerHTML = postKaart(posts[0]);
  }

  if (inhoud) {
    const id = new URLSearchParams(location.search).get("id");
    const p = posts.find((x) => x.id === id) || posts[0];
    document.getElementById("post-titel").textContent = p.titel;
    document.getElementById("post-datum").textContent = formatDatum(p.datum);
    const afb = document.getElementById("post-afbeelding");
    afb.onload = () => {
      if (afb.naturalHeight > afb.naturalWidth) afb.classList.add("portret");
    };
    afb.src = p.afbeelding;
    afb.alt = p.titel;
    inhoud.innerHTML = p.inhoud
      .map((blok) =>
        typeof blok === "string"
          ? `<p>${blok}</p>`
          : `<figure class="post-figuur"><img src="${blok.pad}" alt="${blok.alt}"><figcaption>${blok.onderschrift || blok.alt}</figcaption></figure>`
      )
      .join("");
    document.title = p.titel + " — Legotheek";

    const deelKnop = document.getElementById("deel-facebook");
    deelKnop.href =
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(location.href);

    autoPostNaarFacebook(p);
  }
});
