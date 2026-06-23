import { Link } from 'react-router-dom';
import { formatKnifeDate } from '../utils/formatDate';
import type { KnifeListItem } from '../types/knife';

interface KnifeCardProps {
  knife: KnifeListItem;
}

export default function KnifeCard({ knife }: KnifeCardProps) {
  return (
    <Link to={`/noze/${knife.id}`} className="knife-masonry-item">
      <article className="knife-tile">
        <div className="knife-tile-image">
          {knife.mainImageUrl ? (
            <img src={knife.mainImageUrl} alt={knife.name} loading="lazy" />
          ) : (
            <div className="image-placeholder">Brak zdjęcia</div>
          )}
          <div className="knife-tile-overlay">
            <h2>{knife.name}</h2>
            <p className="knife-tile-price">{knife.price.toFixed(2)} PLN</p>
            <p className="knife-tile-date">{formatKnifeDate(knife.createdAt)}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
