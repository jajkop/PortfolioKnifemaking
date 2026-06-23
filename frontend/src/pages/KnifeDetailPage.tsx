import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import { formatKnifeDate } from '../utils/formatDate';
import type { KnifeDetail } from '../types/knife';

export default function KnifeDetailPage() {
  const { id } = useParams();
  const [knife, setKnife] = useState<KnifeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    apiGet<KnifeDetail>(`/api/knives/${id}`)
      .then((data) => {
        setKnife(data);
        const main = data.images.find((img) => img.isMain) ?? data.images[0];
        setActiveImage(main?.url ?? null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="status-message">Ładowanie...</p>;
  }

  if (error || !knife) {
    return (
      <div className="status-message">
        <p className="error">{error || 'Nóż nie został znaleziony.'}</p>
        <Link to="/">Wróć do listy</Link>
      </div>
    );
  }

  return (
    <section className="knife-detail">
      <Link to="/" className="back-link">
        ← Wróć do portfolio
      </Link>

      <div className="knife-detail-grid">
        <div className="gallery">
          <div className="gallery-main">
            {activeImage ? (
              <img src={activeImage} alt={knife.name} />
            ) : (
              <div className="image-placeholder large">Brak zdjęcia</div>
            )}
          </div>
          {knife.images.length > 1 && (
            <div className="gallery-thumbs">
              {knife.images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  className={activeImage === image.url ? 'active' : ''}
                  onClick={() => setActiveImage(image.url)}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="knife-info">
          <h1>{knife.name}</h1>
          <p className="price large">{knife.price.toFixed(2)} PLN</p>

          <dl className="spec-list">
            <div>
              <dt>Data dodania</dt>
              <dd>{formatKnifeDate(knife.createdAt)}</dd>
            </div>
            <div>
              <dt>Stal</dt>
              <dd>{knife.steel}</dd>
            </div>
            <div>
              <dt>Rękojeść</dt>
              <dd>{knife.handle}</dd>
            </div>
            <div>
              <dt>Pochwa</dt>
              <dd>{knife.sheath}</dd>
            </div>
            <div>
              <dt>Długość całkowita</dt>
              <dd>{knife.totalLength} mm</dd>
            </div>
            <div>
              <dt>Długość robocza</dt>
              <dd>{knife.workingLength} mm</dd>
            </div>
            <div>
              <dt>Szerokość (max)</dt>
              <dd>{knife.maxWidth} mm</dd>
            </div>
            <div>
              <dt>Grubość</dt>
              <dd>{knife.thickness} mm</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
