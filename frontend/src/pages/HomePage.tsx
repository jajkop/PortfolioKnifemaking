import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import EmptyPortfolio from '../components/EmptyPortfolio';
import KnifeCard from '../components/KnifeCard';
import type { KnifeListItem } from '../types/knife';

export default function HomePage() {
  const [knives, setKnives] = useState<KnifeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<KnifeListItem[]>('/api/knives')
      .then((data) =>
        setKnives(
          [...data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        ),
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="portfolio-status">
        <p className="status-message">Ładowanie portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-status">
        <p className="status-message error">{error}</p>
      </div>
    );
  }

  if (knives.length === 0) {
    return <EmptyPortfolio />;
  }

  return (
    <section className="home-page">
      <div className="knife-masonry">
        {knives.map((knife) => (
          <KnifeCard key={knife.id} knife={knife} />
        ))}
      </div>
    </section>
  );
}
