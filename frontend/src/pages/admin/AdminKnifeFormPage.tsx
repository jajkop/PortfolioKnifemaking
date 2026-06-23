import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../../api/client';
import { todayLocalDate, toDateInputValue } from '../../utils/formatDate';
import type { KnifeDetail, KnifeFormData, KnifeImage } from '../../types/knife';

const emptyForm: KnifeFormData = {
  name: '',
  price: 0,
  steel: '',
  handle: '',
  sheath: 'BRAK',
  totalLength: 0,
  workingLength: 0,
  maxWidth: 0,
  thickness: 0,
  createdAt: todayLocalDate(),
};

export default function AdminKnifeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<KnifeFormData>(emptyForm);
  const [images, setImages] = useState<KnifeImage[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [knifeId, setKnifeId] = useState<number | null>(id ? Number(id) : null);

  useEffect(() => {
    if (!id) {
      return;
    }

    apiGet<KnifeDetail>(`/api/admin/knives/${id}`, true)
      .then((knife) => {
        setForm({
          name: knife.name,
          price: knife.price,
          steel: knife.steel,
          handle: knife.handle,
          sheath: knife.sheath,
          totalLength: knife.totalLength,
          workingLength: knife.workingLength,
          maxWidth: knife.maxWidth,
          thickness: knife.thickness,
          createdAt: toDateInputValue(knife.createdAt),
        });
        setImages(knife.images);
        setKnifeId(knife.id);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<K extends keyof KnifeFormData>(field: K, value: KnifeFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEdit && knifeId) {
        await apiPut(`/api/admin/knives/${knifeId}`, form, true);
        setSaveMessage('Zapisano. Możesz teraz zarządzać zdjęciami poniżej.');
      } else {
        const created = await apiPost<KnifeDetail>('/api/admin/knives', form, true);
        setKnifeId(created.id);
        navigate(`/admin/noze/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zapis nie powiódł się.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList?.length || !knifeId) {
      return;
    }

    const files = Array.from(fileList);
    setUploading(true);
    setError(null);
    setUploadProgress(`0/${files.length}`);

    const uploaded: KnifeImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`${i + 1}/${files.length}`);
        const image = await apiUpload<KnifeImage>(`/api/admin/knives/${knifeId}/images`, files[i], true);
        uploaded.push(image);
      }

      setImages((current) => [...current, ...uploaded]);
      setSaveMessage(
        uploaded.length === 1 ? 'Dodano 1 zdjęcie.' : `Dodano ${uploaded.length} zdjęć.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload nie powiódł się.');
      if (uploaded.length > 0) {
        setImages((current) => [...current, ...uploaded]);
      }
    } finally {
      setUploading(false);
      setUploadProgress(null);
      event.target.value = '';
    }
  }

  async function handleSetMain(imageId: number) {
    if (!knifeId) {
      return;
    }

    try {
      await apiPut(`/api/admin/knives/${knifeId}/images/${imageId}/main`, {}, true);
      setImages((current) =>
        current.map((image) => ({
          ...image,
          isMain: image.id === imageId,
        })),
      );
      setSaveMessage('Ustawiono główne zdjęcie.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się ustawić głównego zdjęcia.');
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!knifeId || !window.confirm('Usunąć to zdjęcie?')) {
      return;
    }

    try {
      await apiDelete(`/api/admin/knives/${knifeId}/images/${imageId}`, true);
      setImages((current) => {
        const remaining = current.filter((image) => image.id !== imageId);
        if (remaining.length > 0 && !remaining.some((image) => image.isMain)) {
          remaining[0].isMain = true;
        }
        return remaining;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Usuwanie zdjęcia nie powiodło się.');
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-panel-card admin-loading">
          <span className="admin-spinner" aria-hidden="true" />
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar-text">
          <p className="admin-eyebrow">{isEdit ? 'Edycja' : 'Nowy produkt'}</p>
          <h1>{isEdit ? 'Edytuj nóż' : 'Dodaj nóż'}</h1>
          <p className="admin-subtitle">Uzupełnij dane techniczne i zdjęcia produktu.</p>
        </div>
        <Link to="/admin" className="button ghost">
          ← Wróć do listy
        </Link>
      </header>

      <form className="admin-panel-card admin-form" onSubmit={handleSubmit}>
        <section className="admin-form-section">
          <h2 className="admin-section-title">Podstawowe informacje</h2>
          <div className="form-grid">
          <label>
            Nazwa
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </label>

          <label>
            Data dodania
            <input
              type="date"
              value={form.createdAt}
              onChange={(e) => updateField('createdAt', e.target.value)}
              required
            />
          </label>

          <label>
            Cena (PLN)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField('price', Number(e.target.value))}
              required
            />
          </label>

          <label>
            Stal
            <input
              type="text"
              value={form.steel}
              onChange={(e) => updateField('steel', e.target.value)}
              required
            />
          </label>

          <label>
            Rękojeść
            <input
              type="text"
              value={form.handle}
              onChange={(e) => updateField('handle', e.target.value)}
              required
            />
          </label>

          <label>
            Pochwa
            <input
              type="text"
              value={form.sheath}
              onChange={(e) => updateField('sheath', e.target.value)}
              placeholder="BRAK"
              required
            />
          </label>
          </div>
        </section>

        <section className="admin-form-section">
          <h2 className="admin-section-title">Wymiary</h2>
          <div className="form-grid">
          <label>
            Długość całkowita (mm)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.totalLength}
              onChange={(e) => updateField('totalLength', Number(e.target.value))}
              required
            />
          </label>

          <label>
            Długość robocza (mm)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.workingLength}
              onChange={(e) => updateField('workingLength', Number(e.target.value))}
              required
            />
          </label>

          <label>
            Szerokość max (mm)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.maxWidth}
              onChange={(e) => updateField('maxWidth', Number(e.target.value))}
              required
            />
          </label>

          <label>
            Grubość (mm)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.thickness}
              onChange={(e) => updateField('thickness', Number(e.target.value))}
              required
            />
          </label>
          </div>
        </section>

        {error && (
          <div className="admin-alert admin-alert-error">
            <p>{error}</p>
          </div>
        )}
        {saveMessage && (
          <div className="admin-alert admin-alert-success">
            <p>{saveMessage}</p>
          </div>
        )}

        <div className="admin-form-footer">
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Utwórz nóż'}
          </button>
        </div>
      </form>

      {knifeId && (
        <section className="admin-panel-card admin-images">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Zdjęcia</h2>
            <p className="admin-hint">
              Wybierz główne zdjęcie — będzie widoczne na stronie głównej w galerii.
            </p>
          </div>

          <label className="admin-upload-zone">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <span className="admin-upload-icon" aria-hidden="true">+</span>
            <span className="admin-upload-text">
              {uploading ? `Dodawanie zdjęć (${uploadProgress})...` : 'Kliknij lub przeciągnij zdjęcia'}
            </span>
            <span className="admin-upload-hint">PNG, JPG — wiele plików naraz</span>
          </label>

          <div className="admin-image-grid">
            {images.length === 0 ? (
              <p className="admin-images-empty">Brak zdjęć. Dodaj pierwsze zdjęcie powyżej.</p>
            ) : (
              images.map((image) => (
                <div key={image.id} className="admin-image-card">
                  <button
                    type="button"
                    className={`image-frame ${image.isMain ? 'is-main' : ''}`}
                    onClick={() => !image.isMain && handleSetMain(image.id)}
                    title={image.isMain ? 'To jest główne zdjęcie' : 'Ustaw jako główne'}
                  >
                    {image.isMain && <span className="main-label">Główne</span>}
                    <img src={image.url} alt="" />
                  </button>
                  <div className="admin-image-actions">
                    <button
                      type="button"
                      className="set-main-btn"
                      disabled={image.isMain}
                      onClick={() => handleSetMain(image.id)}
                    >
                      {image.isMain ? 'Wybrane jako główne' : 'Ustaw jako główne'}
                    </button>
                    <button type="button" className="delete-image-btn" onClick={() => handleDeleteImage(image.id)}>
                      Usuń
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
