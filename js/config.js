const CONFIG = {
  // E-mail via EmailJS: de website stuurt de reservering rechtstreeks door,
  // zonder eigen server (https://www.emailjs.com, gratis: 200 mails/mnd).
  // Zet de drie IDs hierin nadat je een account hebt aangemaakt:
  //   1. E-mailadres verbinden (Emails -> "Connect an Email Service")
  //   2. Een template maken met de velden {{naam}}, {{email}}, {{set}},
  //      {{datum}}, {{bericht}} (het veld {{website}} mag leeg blijven)
  //   3. De service-, template- en public-key hieronder plakken
  // Laat publicKey leeg om te vallen terug op een mailto:-link.
  emailJs: {
    serviceId: "",
    templateId: "",
    publicKey: ""
  },
  // E-mailadres voor reserveringen (mailto:-fallback).
  reserverenEmail: "legotheek@example.com",
  // Facebook-pagina voor auto-posten (placeholder, nog niet actief).
  facebookPagina: "https://www.facebook.com/profile.php?id=61593928081483"
};
