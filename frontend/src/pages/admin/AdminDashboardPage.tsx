import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiDelete, apiGet, clearAuthToken } from '../../api/client';
import { formatKnifeDate } from '../../utils/formatDate';
import type { KnifeListItem } from '../../types/knife';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [knives, setKnives] = useState<KnifeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadKnives() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<KnifeListItem[]>('/api/admin/knives', true);
      setKnives(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać listy.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKnives();
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Usunąć nóż "${name}"?`)) {
      return;
    }

    try {
      await apiDelete(`/api/admin/knives/${id}`, true);
      setKnives((current) => current.filter((knife) => knife.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Usuwanie nie powiodło się.');
    }
  }

  function handleLogout() {
    clearAuthToken();
    navigate('/admin/login');
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar-text">
          <p className="admin-eyebrow">Zarządzanie</p>
          <h1>Panel administratora</h1>
          <p className="admin-subtitle">Dodawaj, edytuj i usuwaj noże w portfolio.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/noze/nowy" className="button primary">
            + Dodaj nóż
          </Link>
          <button type="button" className="button ghost" onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Noże w portfolio</span>
          <strong className="admin-stat-value">{loading ? '—' : knives.length}</strong>
        </div>
      </div>

      {loading && (
        <div className="admin-panel-card admin-loading">
          <span className="admin-spinner" aria-hidden="true" />
          <p>Ładowanie listy...</p>
        </div>
      )}

      {error && (
        <div className="admin-panel-card admin-alert admin-alert-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-panel-card">
          {knives.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 22H32M16 28H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2>Brak noży</h2>
              <p>Dodaj pierwszy produkt, żeby pojawił się na stronie głównej.</p>
              <Link to="/admin/noze/nowy" className="button primary">
                Dodaj pierwszy nóż
              </Link>
            </div>
          ) : (
            <ul className="admin-knife-list">
              {knives.map((knife) => (
                <li key={knife.id} className="admin-knife-row">
                  <div className="admin-knife-row-thumb">
                    {knife.mainImageUrl ? (
                      <img src={knife.mainImageUrl} alt={knife.name} />
                    ) : (
                      <span className="admin-knife-row-placeholder">Brak zdjęcia</span>
                    )}
                  </div>
                  <div className="admin-knife-row-body">
                    <h3>{knife.name}</h3>
                    <p>{formatKnifeDate(knife.createdAt)}</p>
                  </div>
                  <div className="admin-knife-row-price">{knife.price.toFixed(2)} PLN</div>
                  <div className="admin-knife-row-actions">
                    <Link to={`/admin/noze/${knife.id}`} className="button small secondary">
                      Edytuj
                    </Link>
                    <button
                      type="button"
                      className="button small danger"
                      onClick={() => handleDelete(knife.id, knife.name)}
                    >
                      Usuń
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
