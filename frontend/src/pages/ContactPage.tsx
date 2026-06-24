export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="contact-card">
        <p className="eyebrow">Kontakt</p>
        <h1>Skontaktuj sie ze mna</h1>
        <p className="contact-intro">
          Masz pytanie o noz, zamowienie indywidualne albo dostepnosc? Napisz lub zadzwon.
        </p>

        <div className="contact-details">
          <p>
            E-mail: <span className="contact-value">jakub.slodownik@gmail.com</span>
          </p>
          <p>
            Telefon: <span className="contact-value">+48 882 488 057</span>
          </p>
        </div>
      </div>
    </section>
  );
}
