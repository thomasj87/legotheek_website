// Helpers rond publicatieDatum van sets: de site toont alleen sets die
// "gereleased" zijn (publicatieDatum <= vandaag, in de datum van de browser).
// Laad dit script vóór sets.js / set.js / form.js.
window.LEGOOTHEEK = window.LEGOOTHEEK || {};

LEGOOTHEEK.vandaag = function () {
  const nu = new Date();
  return nu.getFullYear() + "-" +
    String(nu.getMonth() + 1).padStart(2, "0") + "-" +
    String(nu.getDate()).padStart(2, "0");
};

LEGOOTHEEK.isReleased = function (set) {
  return !set.publicatieDatum || set.publicatieDatum <= LEGOOTHEEK.vandaag();
};

LEGOOTHEEK.gereleased = function (sets) {
  return (sets || []).filter(LEGOOTHEEK.isReleased);
};
