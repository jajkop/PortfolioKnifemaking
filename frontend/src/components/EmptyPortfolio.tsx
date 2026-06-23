export default function EmptyPortfolio() {
  return (
    <div className="empty-portfolio">
      <div className="empty-portfolio-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 52L32 8L52 52H12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M20 40H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2>Portfolio jest puste</h2>
      <p>
        Jeszcze nie dodano żadnych noży. Gdy pojawią się pierwsze prace, zobaczysz je tutaj w
        galerii.
      </p>
    </div>
  );
}
