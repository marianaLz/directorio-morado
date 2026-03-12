import { useState, useEffect, useMemo } from 'react';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  type DocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { isAllowedAdminEmail } from '../../lib/adminConfig';
import type { SupportType, PopulationType, CostType } from '../../types/directory';
import {
  SUPPORT_TYPES,
  POPULATION_OPTIONS,
  COST_OPTIONS,
  COUNTRY_OPTIONS,
  getSupportTypeLabel,
} from '../../data/formOptions';

const COL_PENDING = 'directory_pending';
const COL_DIRECTORY = 'directory';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 60) || 'recurso';
}

function makeId(name: string): string {
  const base = slugify(name);
  return `${base}-${Date.now().toString(36)}`;
}

type DocItem = { id: string; ref: 'pending' | 'directory'; data: Record<string, unknown> };

function docToItem(snap: DocumentSnapshot<DocumentData>, ref: 'pending' | 'directory'): DocItem {
  const data = snap.data() || {};
  return { id: snap.id, ref, data: { ...data, id: ref === 'directory' ? snap.id : undefined } };
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<DocItem[]>([]);
  const [directory, setDirectory] = useState<DocItem[]>([]);
  const [tab, setTab] = useState<'pending' | 'directory'>('pending');
  const [searchPending, setSearchPending] = useState('');
  const [searchDirectory, setSearchDirectory] = useState('');
  const [modal, setModal] = useState<'edit' | 'create' | null>(null);
  const [selected, setSelected] = useState<DocItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'reject';
    onConfirm: () => void;
  } | null>(null);

  const allowed = useMemo(() => isAllowedAdminEmail(user?.email ?? null), [user?.email]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadPending = async () => {
    const snap = await getDocs(collection(db, COL_PENDING));
    setPending(snap.docs.map((d) => docToItem(d, 'pending')));
  };

  const loadDirectory = async () => {
    const snap = await getDocs(collection(db, COL_DIRECTORY));
    setDirectory(snap.docs.map((d) => docToItem(d, 'directory')));
  };

  useEffect(() => {
    if (!allowed) return;
    loadPending();
    loadDirectory();
  }, [allowed]);

  const filteredPending = useMemo(() => {
    const q = searchPending.toLowerCase().trim();
    if (!q) return pending;
    return pending.filter(
      (p) =>
        String(p.data.name).toLowerCase().includes(q) ||
        String(p.data.location).toLowerCase().includes(q) ||
        String(p.data.country).toLowerCase().includes(q)
    );
  }, [pending, searchPending]);

  const filteredDirectory = useMemo(() => {
    const q = searchDirectory.toLowerCase().trim();
    if (!q) return directory;
    return directory.filter(
      (d) =>
        String(d.data.name).toLowerCase().includes(q) ||
        String(d.data.location).toLowerCase().includes(q) ||
        String(d.data.country).toLowerCase().includes(q)
    );
  }, [directory, searchDirectory]);

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleApprove = async (item: DocItem) => {
    if (item.ref !== 'pending') return;
    setSaving(true);
    setError('');
    try {
      const { status, createdAt, submitterEmail, id: _id, ...rest } = item.data as Record<string, unknown>;
      const id = makeId(String(rest.name));
      const payload: Record<string, unknown> = {
        ...rest,
        id,
        state: rest.state ?? '',
        city: rest.city ?? '',
        hours: rest.hours ?? null,
      };
      // Firestore no acepta undefined; eliminar cualquier campo undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });
      await setDoc(doc(db, COL_DIRECTORY, id), payload);
      await deleteDoc(doc(db, COL_PENDING, item.id));
      await loadPending();
      await loadDirectory();
      setModal(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al aprobar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: DocItem) => {
    setConfirmModal({
      title: 'Eliminar recurso',
      message: '¿Eliminar este registro del directorio? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setSaving(true);
        setError('');
        try {
          await deleteDoc(doc(db, COL_DIRECTORY, item.id));
          await loadDirectory();
          setModal(null);
          setSelected(null);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error al eliminar');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleReject = (item: DocItem) => {
    if (item.ref !== 'pending') return;
    setConfirmModal({
      title: 'Rechazar solicitud',
      message: '¿Rechazar esta solicitud? Se eliminará de pendientes y no se publicará en el directorio.',
      confirmLabel: 'Rechazar',
      variant: 'reject',
      onConfirm: async () => {
        setConfirmModal(null);
        setSaving(true);
        setError('');
        try {
          await deleteDoc(doc(db, COL_PENDING, item.id));
          await loadPending();
          setModal(null);
          setSelected(null);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error al rechazar');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleSaveEdit = async (payload: Record<string, unknown>, item: DocItem) => {
    setSaving(true);
    setError('');
    try {
      if (item.ref === 'pending') {
        await setDoc(doc(db, COL_PENDING, item.id), { ...payload, status: 'pending' });
        await loadPending();
      } else {
        await setDoc(doc(db, COL_DIRECTORY, item.id), { ...payload, id: item.id });
        await loadDirectory();
      }
      setModal(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError('');
    try {
      const id = makeId(String(payload.name));
      await setDoc(doc(db, COL_DIRECTORY, id), { ...payload, id });
      await loadDirectory();
      setModal(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--card-text-muted)]">
        Cargando…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
        <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--card-text)]">Panel administrativo</h2>
          <p className="mt-2 text-sm text-[var(--card-text-muted)]">
            Inicia sesión con Google para continuar.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[var(--brand-purple-accent)] px-5 py-3 text-base font-semibold text-white hover:bg-[#7030c4] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
            >
              Entrar con Google
            </button>
            <a
              href="/"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[var(--card-border)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--card-text)] hover:bg-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
        <div
          className="mx-auto w-full max-w-sm rounded-xl border p-8 text-center"
          style={{
            borderColor: 'var(--tag-crisis-text)',
            backgroundColor: 'var(--tag-crisis-bg)',
          }}
        >
          <h2 className="text-xl font-semibold" style={{ color: 'var(--tag-crisis-text)' }}>
            Sin acceso
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--tag-crisis-text)' }}>
            Tu cuenta ({user.email}) no tiene permiso para acceder a este panel.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 text-sm font-medium underline hover:no-underline"
            style={{ color: 'var(--tag-crisis-text)' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const list = tab === 'pending' ? filteredPending : filteredDirectory;
  const search = tab === 'pending' ? searchPending : searchDirectory;
  const setSearch = tab === 'pending' ? setSearchPending : setSearchDirectory;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--card-text)]">Panel admin</h1>
          <span className="text-sm text-[var(--card-text-muted)]">{user.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-[var(--brand-purple-accent)] hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[var(--card-border)]">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`border-b-2 px-4 py-2 text-sm font-medium focus:outline-none ${
            tab === 'pending'
              ? 'border-[var(--brand-purple-accent)] text-[var(--brand-purple-accent)]'
              : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--card-text)]'
          }`}
        >
          Pendientes ({pending.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('directory')}
          className={`border-b-2 px-4 py-2 text-sm font-medium focus:outline-none ${
            tab === 'directory'
              ? 'border-[var(--brand-purple-accent)] text-[var(--brand-purple-accent)]'
              : 'border-transparent text-[var(--card-text-muted)] hover:text-[var(--card-text)]'
          }`}
        >
          Aceptados ({directory.length})
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Buscar por nombre, ubicación, país…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] flex-1 min-w-[200px] rounded-xl border border-[var(--card-border)] bg-white px-4 py-2 text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
        />
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setModal('create');
          }}
          className="min-h-[44px] rounded-xl bg-[var(--brand-purple-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7030c4] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
        >
          Crear recurso
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-slate-50">
              <th className="p-3 font-medium text-[var(--card-text)]">Nombre</th>
              <th className="p-3 font-medium text-[var(--card-text)]">Ubicación</th>
              <th className="p-3 font-medium text-[var(--card-text)]">País</th>
              <th className="p-3 font-medium text-[var(--card-text)]">Tipo</th>
              <th className="p-3 font-medium text-[var(--card-text)] w-[1%] whitespace-nowrap" style={{ minWidth: '220px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[var(--card-text-muted)]">
                  {tab === 'pending' ? 'No hay solicitudes pendientes.' : 'No hay recursos.'}
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={`${item.ref}-${item.id}`} className="border-b border-[var(--card-border)] hover:bg-slate-50">
                  <td className="p-3 font-medium text-[var(--card-text)]">{String(item.data.name)}</td>
                  <td className="p-3 text-[var(--card-text-muted)]">{String(item.data.location || '')}</td>
                  <td className="p-3 text-[var(--card-text-muted)]">{String(item.data.country || '')}</td>
                  <td className="p-3 text-[var(--card-text-muted)]">
                    {Array.isArray(item.data.type)
                      ? (item.data.type as string[]).map(getSupportTypeLabel).join(', ')
                      : ''}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setModal('edit');
                        }}
                        className="text-[var(--brand-purple-accent)] hover:underline"
                      >
                        Ver / Editar
                      </button>
                      {tab === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={saving}
                            className="text-emerald-600 hover:underline disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item)}
                            disabled={saving}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={saving}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(modal === 'edit' || modal === 'create') && (
        <ResourceModal
          item={modal === 'create' ? null : selected}
          mode={modal}
          onClose={() => {
            setModal(null);
            setSelected(null);
            setError('');
          }}
          onSaveEdit={(payload) => selected && handleSaveEdit(payload, selected)}
          onCreate={handleCreate}
          saving={saving}
        />
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-sm rounded-xl border border-[var(--card-border)] bg-white p-6 shadow-xl">
            <h3 id="confirm-title" className="text-lg font-semibold text-[var(--card-text)]">
              {confirmModal.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--card-text-muted)]">
              {confirmModal.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[var(--card-text)] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => confirmModal.onConfirm()}
                disabled={saving}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                  confirmModal.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {saving ? '…' : confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal de edición / creación (ves la data y puedes editarla)
type ResourceModalProps = {
  item: DocItem | null;
  mode: 'edit' | 'create';
  onClose: () => void;
  onSaveEdit: (payload: Record<string, unknown>) => void;
  onCreate: (payload: Record<string, unknown>) => void;
  saving: boolean;
};

const defaultPayload: Record<string, unknown> = {
  name: '',
  description: '',
  location: '',
  country: 'Mexico',
  state: '',
  city: '',
  type: [],
  cost: 'consult directly',
  population: ['general public'],
  online: true,
  inPerson: false,
  instagram: null,
  website: null,
  phone: null,
  whatsapp: null,
  hours: null,
  isEmergency: false,
};

function ResourceModal({ item, mode, onClose, onSaveEdit, onCreate, saving }: ResourceModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>(defaultPayload);

  useEffect(() => {
    if (item?.data) {
      const data = item.data as Record<string, unknown>;
      const merged = { ...defaultPayload, ...data };
      if (!('inPerson' in data)) merged.inPerson = !data.online;
      setForm(merged);
    } else if (mode === 'create') setForm({ ...defaultPayload });
  }, [item, mode]);

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleType = (t: SupportType) => {
    const types = (form.type as SupportType[]) || [];
    const next = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
    update('type', next);
  };

  const togglePopulation = (p: PopulationType) => {
    const pop = (form.population as PopulationType[]) || [];
    const next = pop.includes(p) ? pop.filter((x) => x !== p) : [...pop, p];
    update('population', next.length ? next : ['general public']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (mode === 'create') onCreate(payload);
    else if (item) onSaveEdit(payload);
  };

  const inputClass =
    'mt-1 block w-full min-h-[40px] rounded-lg border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-purple-accent)]';
  const labelClass = 'block text-sm font-medium text-[var(--card-text)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--card-border)] bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--card-text)]">
            {mode === 'edit' ? 'Ver / Editar' : 'Crear recurso'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              type="text"
              required
              value={String(form.name ?? '')}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Descripción *</label>
            <textarea
              required
              rows={3}
              value={String(form.description ?? '')}
              onChange={(e) => update('description', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ubicación *</label>
              <input
                type="text"
                required
                value={String(form.location ?? '')}
                onChange={(e) => update('location', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>País *</label>
              <select
                required
                value={String(form.country ?? 'Mexico')}
                onChange={(e) => update('country', e.target.value)}
                className={inputClass}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                type="text"
                value={String(form.instagram ?? '')}
                onChange={(e) => update('instagram', e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sitio web</label>
              <input
                type="url"
                value={String(form.website ?? '')}
                onChange={(e) => update('website', e.target.value || null)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={String(form.phone ?? '')}
                onChange={(e) => update('phone', e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                type="tel"
                value={String(form.whatsapp ?? '')}
                onChange={(e) => update('whatsapp', e.target.value || null)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <span className={labelClass}>Tipo de apoyo *</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {SUPPORT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    (form.type as string[])?.includes(t)
                      ? 'bg-[var(--brand-purple-accent)] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getSupportTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Costo *</label>
            <select
              required
              value={String(form.cost ?? 'consult directly')}
              onChange={(e) => update('cost', e.target.value as CostType)}
              className={inputClass}
            >
              {COST_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={labelClass}>Población</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {POPULATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => togglePopulation(opt.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    (form.population as string[])?.includes(opt.value)
                      ? 'bg-violet-100 text-violet-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelClass}>Modalidad</span>
            <p className="mt-1 text-xs text-[var(--card-text-muted)]">Puedes marcar una o ambas.</p>
            <div className="mt-1 flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--card-text)]">
                <input
                  type="checkbox"
                  checked={form.online === true}
                  onChange={(e) => update('online', e.target.checked)}
                  className="rounded border-gray-300 text-[var(--brand-purple-accent)]"
                />
                En línea
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--card-text)]">
                <input
                  type="checkbox"
                  checked={form.inPerson === true}
                  onChange={(e) => update('inPerson', e.target.checked)}
                  className="rounded border-gray-300 text-[var(--brand-purple-accent)]"
                />
                Presencial
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[var(--card-text)] hover:bg-gray-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--brand-purple-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7030c4] disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
