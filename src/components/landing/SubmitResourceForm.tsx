import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { SupportType, PopulationType, CostType } from '../../types/directory';
import {
  SUPPORT_TYPES,
  POPULATION_OPTIONS,
  COST_OPTIONS,
  COUNTRY_OPTIONS,
  getSupportTypeLabel,
} from '../../data/formOptions';

const PENDING_COLLECTION = 'directory_pending';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const emptyForm = {
  name: '',
  description: '',
  instagram: '',
  website: '',
  phone: '',
  whatsapp: '',
  location: '',
  country: '',
  countryOther: '',
  types: [] as SupportType[],
  cost: '' as CostType | '',
  population: [] as PopulationType[],
  online: true,
};

function validateWebsite(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

export default function SubmitResourceForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const update = (key: keyof typeof form, value: string | boolean | SupportType[] | PopulationType[] | CostType) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage('');
  };

  const toggleType = (t: SupportType) => {
    setForm((prev) => ({
      ...prev,
      types: prev.types.includes(t) ? prev.types.filter((x) => x !== t) : [...prev.types, t],
    }));
    setErrorMessage('');
  };

  const togglePopulation = (p: PopulationType) => {
    setForm((prev) => ({
      ...prev,
      population: prev.population.includes(p)
        ? prev.population.filter((x) => x !== p)
        : [...prev.population, p],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const name = form.name.trim();
    const description = form.description.trim();
    const country = form.country === 'Otro' ? form.countryOther.trim() : form.country;

    if (!name) {
      setErrorMessage('El nombre del recurso o organización es obligatorio.');
      return;
    }
    if (!description) {
      setErrorMessage('La descripción es obligatoria.');
      return;
    }
    if (form.types.length === 0) {
      setErrorMessage('Selecciona al menos un tipo de apoyo.');
      return;
    }
    if (!form.cost) {
      setErrorMessage('Indica el costo.');
      return;
    }
    if (!country) {
      setErrorMessage('Indica el país.');
      return;
    }
    if (!form.location.trim()) {
      setErrorMessage('Indica la ubicación.');
      return;
    }
    if (!validateWebsite(form.website)) {
      setErrorMessage('La URL del sitio web no es válida.');
      return;
    }

    setStatus('submitting');

    try {
      await addDoc(collection(db, PENDING_COLLECTION), {
        status: 'pending',
        createdAt: serverTimestamp(),
        name,
        description,
        instagram: form.instagram.trim() || null,
        website: form.website.trim() ? (form.website.trim().startsWith('http') ? form.website.trim() : `https://${form.website.trim()}`) : null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        location: form.location.trim() || '',
        country,
        state: '',
        city: '',
        type: form.types,
        cost: form.cost,
        population: form.population.length ? form.population : ['general public'],
        online: form.online,
      });
      setStatus('success');
      setForm(emptyForm);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo enviar. Intenta de nuevo.');
    }
  };

  const inputClass =
    'mt-1 block w-full min-h-[44px] rounded-xl border border-[var(--card-border)] bg-white px-4 py-2.5 text-base text-[var(--card-text)] placeholder-[var(--card-text-muted)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2';
  const labelClass = 'block text-sm font-medium text-[var(--card-text)]';

  if (status === 'success') {
    return (
      <div
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800"
        role="status"
      >
        <p className="font-semibold">Solicitud enviada</p>
        <p className="mt-2 text-sm">
          Tu propuesta será revisada antes de publicarse en el directorio. No es necesario hacer nada más.
        </p>
      </div>
    );
  }

  return (
    <section
      id="sugerir-recurso"
      aria-labelledby="form-title"
    >
      <div className="mx-auto">
        <h1 id="form-title" className="text-2xl font-bold text-[var(--card-text)] sm:text-3xl">
          Sugerir un recurso
        </h1>
        <p className="mt-2 text-[var(--card-text-muted)] text-base leading-[1.6] mb-8">
          Propón una organización, colectiva o profesional para el directorio. Las solicitudes se revisan antes de publicarse.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm">
          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {errorMessage}
            </p>
          )}
          {status === 'error' && !errorMessage && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              No se pudo enviar. Revisa tu conexión e intenta de nuevo.
            </p>
          )}

          <div>
            <label htmlFor="name" className={labelClass}>
              Nombre del recurso o organización <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
              placeholder="Ej. Colectiva X, Psic. María López"
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Descripción <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className={inputClass}
              placeholder="Qué tipo de apoyo ofrecen, a quién va dirigido, si es gratuito o con costo..."
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="instagram" className={labelClass}>Instagram (usuario)</label>
              <input
                id="instagram"
                type="text"
                value={form.instagram}
                onChange={(e) => update('instagram', e.target.value.replace('@', ''))}
                className={inputClass}
                placeholder="usuario"
              />
            </div>
            <div>
              <label htmlFor="website" className={labelClass}>Sitio web</label>
              <input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={labelClass}>Teléfono</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className={labelClass}>WhatsApp (número con lada)</label>
              <input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                className={inputClass}
                placeholder="Ej. 5215512345678"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className={labelClass}>
                País <span className="text-red-600">*</span>
              </label>
              <select
                id="country"
                required
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className={inputClass}
              >
                <option value="">Selecciona</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>
                Ubicación <span className="text-red-600">*</span>
              </label>
              <input
                id="location"
                type="text"
                required
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass}
                placeholder="Ej. Nacional, CDMX, Guadalajara"
              />
            </div>
          </div>
          {form.country === 'Otro' && (
            <div>
              <label htmlFor="countryOther" className={labelClass}>Especificar país</label>
              <input
                id="countryOther"
                type="text"
                value={form.countryOther}
                onChange={(e) => update('countryOther', e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <span className={labelClass}>
              Tipo de apoyo <span className="text-red-600">*</span> (al menos uno)
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPPORT_TYPES.map((t) => {
                const selected = form.types.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 ${
                      selected
                        ? 'bg-[var(--brand-purple-accent)] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {getSupportTypeLabel(t)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="cost" className={labelClass}>
                Costo <span className="text-red-600">*</span>
              </label>
              <select
                id="cost"
                required
                value={form.cost}
                onChange={(e) => update('cost', e.target.value as CostType)}
                className={inputClass}
              >
                <option value="">Selecciona</option>
                {COST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelClass}>Modalidad</span>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--card-text)]">
                  <input
                    type="radio"
                    name="online"
                    checked={form.online === true}
                    onChange={() => update('online', true)}
                    className="rounded-full border-gray-300 text-[var(--brand-purple-accent)] focus:ring-[var(--brand-purple-accent)]"
                  />
                  <span>En línea</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--card-text)]">
                  <input
                    type="radio"
                    name="online"
                    checked={form.online === false}
                    onChange={() => update('online', false)}
                    className="rounded-full border-gray-300 text-[var(--brand-purple-accent)] focus:ring-[var(--brand-purple-accent)]"
                  />
                  <span>Presencial</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <span className={labelClass}>Población a la que va dirigido</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {POPULATION_OPTIONS.map((opt) => {
                const selected = form.population.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => togglePopulation(opt.value)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 ${
                      selected
                        ? 'bg-violet-100 text-violet-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full min-h-[48px] rounded-xl bg-[var(--brand-purple-accent)] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#7030c4] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed w-fit"
            >
              {status === 'submitting' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
