import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiPost, isAuthenticated, setAuthToken } from '../../api/client';
import type { LoginResponse } from '../../types/knife';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost<LoginResponse>('/api/auth/login', { username, password });
      setAuthToken(response.token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logowanie nie powiodło się.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <div className="admin-login-brand">
          <p className="admin-eyebrow">Portfolio knifemaking</p>
          <h1>Panel administratora</h1>
          <p>Zaloguj się, aby zarządzać nożami i zdjęciami w galerii.</p>
        </div>

        <form className="admin-login-card" onSubmit={handleSubmit}>
          <label>
            Login
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Hasło
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="admin-alert admin-alert-error">
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="button primary full-width" disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>

          <Link to="/" className="admin-login-back">
            ← Wróć na stronę główną
          </Link>
        </form>
      </div>
    </div>
  );
}
