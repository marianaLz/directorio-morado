import { useState, useEffect, useMemo } from "react";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  type DocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { isAllowedAdminEmail } from "../../lib/adminConfig";
import type {
  SupportType,
  PopulationType,
  CostType,
} from "../../types/directory";
import {
  SUPPORT_TYPES,
  POPULATION_OPTIONS,
  COST_OPTIONS,
  COUNTRY_OPTIONS,
  getSupportTypeLabel,
} from "../../data/formOptions";
import {
  TYPE_TAG_CONFIG,
  TYPE_TAG_CLASS,
  META_TAG_CLASS,
} from "../../lib/tagConfig";
import ButtonSolid from "../ui/ButtonSolid";
import ButtonOutline from "../ui/ButtonOutline";
import ButtonGhost from "../ui/ButtonGhost";
import Dimo from "../../assets/svg/Dimo";
import { buttonSolidClass } from "../ui/buttonClasses";

const COL_PENDING = "directory_pending";
const COL_DIRECTORY = "directory";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 60) || "recurso"
  );
}

function makeId(name: string): string {
  const base = slugify(name);
  return `${base}-${Date.now().toString(36)}`;
}

type DocItem = {
  id: string;
  ref: "pending" | "directory";
  data: Record<string, unknown>;
};

function docToItem(
  snap: DocumentSnapshot<DocumentData>,
  ref: "pending" | "directory",
): DocItem {
  const data = snap.data() || {};
  return {
    id: snap.id,
    ref,
    data: { ...data, id: ref === "directory" ? snap.id : undefined },
  };
}

function stripUndefined(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const clean = { ...payload };
  Object.keys(clean).forEach((key) => {
    if (clean[key] === undefined) delete clean[key];
  });
  return clean;
}

function formFieldsFromDoc(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const { status, createdAt, submitterEmail, id: _id, ...rest } = data;
  return rest;
}

function formatRegistro(data: Record<string, unknown>): string {
  const raw = data.createdAt ?? data.updatedAt;
  if (!raw) return "—";
  try {
    let date: Date | null = null;
    if (
      typeof raw === "object" &&
      raw !== null &&
      "toDate" in raw &&
      typeof (raw as { toDate: () => Date }).toDate === "function"
    ) {
      date = (raw as { toDate: () => Date }).toDate();
    } else if (typeof raw === "string" || typeof raw === "number") {
      date = new Date(raw);
    }
    if (!date || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function TypeCell({ types }: { types: unknown }) {
  if (!Array.isArray(types) || types.length === 0) {
    return <span className="text-[var(--brand-gray)]/60">—</span>;
  }
  const known = (types as string[]).filter((t) => TYPE_TAG_CONFIG[t]);
  const shown = known.slice(0, 2);
  const extra = known.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((t) => {
        const config = TYPE_TAG_CONFIG[t];
        return (
          <span
            key={t}
            className={`${TYPE_TAG_CLASS} ${config.bgClass} ${config.textClass}`}
          >
            {config.label}
          </span>
        );
      })}
      {extra > 0 && <span className={META_TAG_CLASS}>+{extra}</span>}
    </div>
  );
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<DocItem[]>([]);
  const [directory, setDirectory] = useState<DocItem[]>([]);
  const [tab, setTab] = useState<"pending" | "directory">("pending");
  const [searchPending, setSearchPending] = useState("");
  const [searchDirectory, setSearchDirectory] = useState("");
  const [modal, setModal] = useState<"edit" | "create" | null>(null);
  const [selected, setSelected] = useState<DocItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "primary";
    onConfirm: () => void;
  } | null>(null);

  const allowed = useMemo(
    () => isAllowedAdminEmail(user?.email ?? null),
    [user?.email],
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && !isAllowedAdminEmail(u.email)) {
        setToast("Tu cuenta no tiene permiso para acceder a este panel.");
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!confirmModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmModal]);

  const loadPending = async () => {
    const snap = await getDocs(collection(db, COL_PENDING));
    setPending(snap.docs.map((d) => docToItem(d, "pending")));
  };

  const loadDirectory = async () => {
    const snap = await getDocs(collection(db, COL_DIRECTORY));
    setDirectory(snap.docs.map((d) => docToItem(d, "directory")));
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
        String(p.data.country).toLowerCase().includes(q),
    );
  }, [pending, searchPending]);

  const filteredDirectory = useMemo(() => {
    const q = searchDirectory.toLowerCase().trim();
    if (!q) return directory;
    return directory.filter(
      (d) =>
        String(d.data.name).toLowerCase().includes(q) ||
        String(d.data.location).toLowerCase().includes(q) ||
        String(d.data.country).toLowerCase().includes(q),
    );
  }, [directory, searchDirectory]);

  const handleLogin = async () => {
    setError("");
    setToast("");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (!isAllowedAdminEmail(result.user.email)) {
        await signOut(auth);
        setToast("Tu cuenta no tiene permiso para acceder a este panel.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleApprove = (item: DocItem) => {
    if (item.ref !== "pending") return;
    setConfirmModal({
      title: "Aprobar solicitud",
      message: `¿Publicar «${String(item.data.name)}» en el directorio?`,
      confirmLabel: "Aprobar",
      variant: "primary",
      onConfirm: async () => {
        setConfirmModal(null);
        setSaving(true);
        setError("");
        try {
          const {
            status,
            createdAt,
            submitterEmail,
            id: _id,
            ...rest
          } = item.data as Record<string, unknown>;
          void status;
          void submitterEmail;
          const id = makeId(String(rest.name));
          const payload: Record<string, unknown> = {
            ...rest,
            id,
            state: rest.state ?? "",
            city: rest.city ?? "",
            hours: rest.hours ?? null,
            ...(createdAt != null ? { createdAt } : {}),
          };
          Object.keys(payload).forEach((key) => {
            if (payload[key] === undefined) delete payload[key];
          });
          await setDoc(doc(db, COL_DIRECTORY, id), payload);
          await deleteDoc(doc(db, COL_PENDING, item.id));
          await loadPending();
          await loadDirectory();
          setModal(null);
          setSelected(null);
          setToast("Recurso aprobado y publicado.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al aprobar");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleDelete = (item: DocItem) => {
    setConfirmModal({
      title: "Eliminar recurso",
      message: `¿Eliminar «${String(item.data.name)}» del directorio? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
        setSaving(true);
        setError("");
        try {
          await deleteDoc(doc(db, COL_DIRECTORY, item.id));
          await loadDirectory();
          setModal(null);
          setSelected(null);
          setToast("Recurso eliminado.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al eliminar");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleReject = (item: DocItem) => {
    if (item.ref !== "pending") return;
    setConfirmModal({
      title: "Rechazar solicitud",
      message: `¿Rechazar «${String(item.data.name)}»? Se eliminará de pendientes y no se publicará.`,
      confirmLabel: "Rechazar",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
        setSaving(true);
        setError("");
        try {
          await deleteDoc(doc(db, COL_PENDING, item.id));
          await loadPending();
          setModal(null);
          setSelected(null);
          setToast("Solicitud rechazada.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al rechazar");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleSaveEdit = async (
    payload: Record<string, unknown>,
    item: DocItem,
  ) => {
    setSaving(true);
    setError("");
    try {
      const clean = stripUndefined(payload);
      if (item.ref === "pending") {
        const { status: _s, createdAt, ...fields } = clean;
        await setDoc(
          doc(db, COL_PENDING, item.id),
          stripUndefined({
            ...fields,
            status: "pending",
            ...(createdAt != null ? { createdAt } : {}),
          }),
        );
        await loadPending();
      } else {
        const { status: _s, createdAt: _c, ...fields } = clean;
        await setDoc(
          doc(db, COL_DIRECTORY, item.id),
          stripUndefined({ ...fields, id: item.id }),
        );
        await loadDirectory();
      }
      setModal(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const id = makeId(String(payload.name));
      const { status: _s, createdAt: _c, ...fields } = payload;
      await setDoc(
        doc(db, COL_DIRECTORY, id),
        stripUndefined({ ...fields, id }),
      );
      await loadDirectory();
      setModal(null);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--brand-gray)]">
        Cargando…
      </div>
    );
  }

  const toastEl = toast ? (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded-xl bg-[var(--brand-gray)] px-4 py-3 text-center text-sm text-[var(--brand-white)] shadow-lg"
    >
      {toast}
    </div>
  ) : null;

  if (!user || !allowed) {
    return (
      <>
        {toastEl}
        <div className="flex min-h-[75vh] flex-col items-center justify-center">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-[var(--brand-white)] p-8 text-center shadow-[0_2px_16px_rgba(76,74,77,0.08)] lg:p-10">
            <div className="mx-auto w-40 lg:w-48">
              <Dimo color="var(--brand-primary)" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-[var(--brand-primary)] lg:text-3xl">
              Panel administrativo
            </h1>
            <p className="mt-3 text-base text-[var(--brand-gray)]">
              Inicia sesión con Google para gestionar recursos y solicitudes.
            </p>
            {error && (
              <p
                className="mt-4 rounded-lg bg-[var(--tag-crisis-bg)] px-3 py-2 text-sm text-[var(--tag-crisis-text)]"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <ButtonSolid
                type="button"
                onClick={handleLogin}
                className="w-full"
              >
                Entrar con Google
              </ButtonSolid>
              <ButtonGhost href="/" className="w-full">
                Volver al inicio
              </ButtonGhost>
            </div>
          </div>
        </div>
      </>
    );
  }

  const list = tab === "pending" ? filteredPending : filteredDirectory;
  const search = tab === "pending" ? searchPending : searchDirectory;
  const setSearch = tab === "pending" ? setSearchPending : setSearchDirectory;

  return (
    <div className="space-y-6">
      {toastEl}

      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--brand-white)] p-4 shadow-[0_2px_12px_rgba(76,74,77,0.06)] sm:p-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="hidden w-28 shrink-0 sm:block">
            <Dimo color="var(--brand-primary)" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[var(--brand-primary)] sm:text-2xl">
              Panel admin
            </h1>
            <p className="mt-0.5 truncate text-sm text-[var(--brand-gray)]">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonGhost href="/" className="text-sm">
            Ver sitio
          </ButtonGhost>
          <ButtonGhost type="button" onClick={handleLogout} className="text-sm">
            Cerrar sesión
          </ButtonGhost>
        </div>
      </header>

      <div className="rounded-2xl bg-[var(--brand-white)] p-4 shadow-[0_2px_12px_rgba(76,74,77,0.06)] sm:p-5">
        <div
          className="flex gap-1 rounded-xl bg-[var(--brand-lavender)]/60 p-1"
          role="tablist"
          aria-label="Secciones del panel"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "pending"}
            onClick={() => setTab("pending")}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-lilac)] focus:ring-offset-2 ${
              tab === "pending"
                ? "bg-[var(--brand-white)] text-[var(--brand-primary)] shadow-sm"
                : "text-[var(--brand-gray)] hover:text-[var(--brand-primary)]"
            }`}
          >
            Pendientes
            <span
              className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                tab === "pending"
                  ? "bg-[var(--brand-primary)] text-[var(--brand-white)]"
                  : "bg-[var(--brand-white)]/80 text-[var(--brand-gray)]"
              }`}
            >
              {pending.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "directory"}
            onClick={() => setTab("directory")}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-lilac)] focus:ring-offset-2 ${
              tab === "directory"
                ? "bg-[var(--brand-white)] text-[var(--brand-primary)] shadow-sm"
                : "text-[var(--brand-gray)] hover:text-[var(--brand-primary)]"
            }`}
          >
            Publicados
            <span
              className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                tab === "directory"
                  ? "bg-[var(--brand-primary)] text-[var(--brand-white)]"
                  : "bg-[var(--brand-white)]/80 text-[var(--brand-gray)]"
              }`}
            >
              {directory.length}
            </span>
          </button>
        </div>

        {error && (
          <div
            className="mt-4 rounded-xl bg-[var(--tag-crisis-bg)] px-4 py-3 text-sm text-[var(--tag-crisis-text)]"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="admin-search" className="sr-only">
            Buscar recursos
          </label>
          <input
            id="admin-search"
            type="search"
            placeholder="Buscar por nombre, ubicación o país…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] w-full flex-1 rounded-xl border border-[var(--brand-lilac)]/50 bg-[var(--brand-white)] px-4 py-2.5 text-[var(--brand-gray)] placeholder:text-[var(--brand-gray)]/50 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          />
          {search.trim() !== "" && (
            <ButtonGhost
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0"
            >
              Limpiar
            </ButtonGhost>
          )}
          <ButtonSolid
            type="button"
            onClick={() => {
              setSelected(null);
              setModal("create");
            }}
            className="shrink-0 !px-4 !py-3 text-sm"
          >
            Crear recurso
          </ButtonSolid>
        </div>

        <p className="mt-3 text-sm text-[var(--brand-gray)]" role="status">
          {list.length} resultado{list.length !== 1 ? "s" : ""}
          {search.trim() ? ` para «${search.trim()}»` : ""}.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--brand-lavender)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--brand-lavender)] bg-[var(--brand-lavender)]/50">
                <th className="p-3 font-semibold text-[var(--brand-gray)]">
                  Nombre
                </th>
                <th className="p-3 font-semibold text-[var(--brand-gray)]">
                  Ubicación
                </th>
                <th className="p-3 font-semibold text-[var(--brand-gray)]">
                  País
                </th>
                <th className="p-3 font-semibold text-[var(--brand-gray)]">
                  Tipo
                </th>
                <th className="p-3 font-semibold text-[var(--brand-gray)] whitespace-nowrap">
                  Registro
                </th>
                <th className="p-3 font-semibold text-[var(--brand-gray)] whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-[var(--brand-gray)]"
                  >
                    <p className="font-medium">
                      {tab === "pending"
                        ? "No hay solicitudes pendientes"
                        : "No hay recursos publicados"}
                    </p>
                    <p className="mt-1 text-sm opacity-80">
                      {search.trim()
                        ? "Prueba otra búsqueda o limpia el filtro."
                        : tab === "pending"
                          ? "Las nuevas sugerencias aparecerán aquí."
                          : "Crea un recurso o aprueba una solicitud pendiente."}
                    </p>
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr
                    key={`${item.ref}-${item.id}`}
                    className="border-b border-[var(--brand-lavender)] last:border-0 hover:bg-[var(--brand-lavender)]/30"
                  >
                    <td className="p-3 font-medium text-[var(--brand-gray)]">
                      {String(item.data.name)}
                    </td>
                    <td className="p-3 text-[var(--brand-gray)]">
                      {String(item.data.location || "—")}
                    </td>
                    <td className="p-3 text-[var(--brand-gray)]">
                      {String(item.data.country) === "Mexico"
                        ? "México"
                        : String(item.data.country || "—")}
                    </td>
                    <td className="p-3">
                      <TypeCell types={item.data.type} />
                    </td>
                    <td className="p-3 whitespace-nowrap text-[var(--brand-gray)]/80">
                      {formatRegistro(item.data)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <ButtonGhost
                          type="button"
                          onClick={() => {
                            setSelected(item);
                            setModal("edit");
                          }}
                        >
                          Editar
                        </ButtonGhost>
                        {tab === "pending" ? (
                          <>
                            <ButtonGhost
                              type="button"
                              onClick={() => handleApprove(item)}
                              disabled={saving}
                              className="!border-[var(--brand-green)]/30 !text-[var(--brand-green)] hover:!bg-[var(--brand-sage)]/40"
                            >
                              Aprobar
                            </ButtonGhost>
                            <ButtonGhost
                              type="button"
                              onClick={() => handleReject(item)}
                              disabled={saving}
                              className="!border-[var(--brand-red)]/25 !text-[var(--brand-red)] hover:!bg-[var(--tag-crisis-bg)]"
                            >
                              Rechazar
                            </ButtonGhost>
                          </>
                        ) : (
                          <ButtonGhost
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={saving}
                            className="!border-[var(--brand-red)]/25 !text-[var(--brand-red)] hover:!bg-[var(--tag-crisis-bg)]"
                          >
                            Eliminar
                          </ButtonGhost>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === "edit" || modal === "create") && (
        <ResourceModal
          item={modal === "create" ? null : selected}
          mode={modal}
          onClose={() => {
            setModal(null);
            setSelected(null);
            setError("");
          }}
          onSaveEdit={handleSaveEdit}
          onCreate={handleCreate}
          saving={saving}
        />
      )}

      {confirmModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmModal(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setConfirmModal(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-[var(--brand-white)] p-6 shadow-xl">
            <h3
              id="confirm-title"
              className="text-lg font-semibold text-[var(--brand-primary)]"
            >
              {confirmModal.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--brand-gray)]">
              {confirmModal.message}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <ButtonGhost type="button" onClick={() => setConfirmModal(null)}>
                Cancelar
              </ButtonGhost>
              <button
                type="button"
                onClick={() => confirmModal.onConfirm()}
                disabled={saving}
                className={
                  confirmModal.variant === "danger"
                    ? `${buttonSolidClass} !border-[var(--brand-red)] !bg-[var(--brand-red)] !px-4 !py-3 text-sm`
                    : `${buttonSolidClass} !px-4 !py-3 text-sm`
                }
              >
                {saving ? "…" : confirmModal.confirmLabel}
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
  mode: "edit" | "create";
  onClose: () => void;
  onSaveEdit: (payload: Record<string, unknown>, item: DocItem) => void;
  onCreate: (payload: Record<string, unknown>) => void;
  saving: boolean;
};

function emptyFormPayload(): Record<string, unknown> {
  return {
    name: "",
    description: "",
    location: "",
    country: "Mexico",
    state: "",
    city: "",
    type: [],
    cost: "consult directly",
    population: ["general public"],
    online: true,
    inPerson: false,
    instagram: null,
    website: null,
    phone: null,
    whatsapp: null,
    hours: null,
    isEmergency: false,
  };
}

function ResourceModal({
  item,
  mode,
  onClose,
  onSaveEdit,
  onCreate,
  saving,
}: ResourceModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>(emptyFormPayload);

  useEffect(() => {
    if (item?.data) {
      const data = item.data as Record<string, unknown>;
      const merged = { ...emptyFormPayload(), ...formFieldsFromDoc(data) };
      if (!("inPerson" in data)) merged.inPerson = !data.online;
      setForm(merged);
    } else if (mode === "create") setForm(emptyFormPayload());
  }, [item?.id, item?.ref, mode]);

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleType = (t: SupportType) => {
    const types = (form.type as SupportType[]) || [];
    const next = types.includes(t)
      ? types.filter((x) => x !== t)
      : [...types, t];
    update("type", next);
  };

  const togglePopulation = (p: PopulationType) => {
    const pop = (form.population as PopulationType[]) || [];
    const next = pop.includes(p) ? pop.filter((x) => x !== p) : [...pop, p];
    update("population", next.length ? next : ["general public"]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (mode === "create") onCreate(payload);
    else if (item) onSaveEdit(payload, item);
  };

  const inputClass =
    "mt-1 block w-full min-h-[40px] rounded-xl border border-[var(--brand-lilac)] bg-[var(--brand-white)] px-3 py-2 text-sm text-[var(--brand-text)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]";
  const labelClass = "block text-sm font-medium text-[var(--brand-text)]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--brand-lilac)] bg-[var(--brand-white)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--brand-text)]">
            {mode === "edit" ? "Ver / Editar" : "Crear recurso"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              type="text"
              required
              value={String(form.name ?? "")}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Descripción *</label>
            <textarea
              required
              rows={3}
              value={String(form.description ?? "")}
              onChange={(e) => update("description", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ubicación *</label>
              <input
                type="text"
                required
                value={String(form.location ?? "")}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>País *</label>
              <select
                required
                value={String(form.country ?? "Mexico")}
                onChange={(e) => update("country", e.target.value)}
                className={inputClass}
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Instagram</label>
              <input
                type="text"
                value={String(form.instagram ?? "")}
                onChange={(e) => update("instagram", e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sitio web</label>
              <input
                type="url"
                value={String(form.website ?? "")}
                onChange={(e) => update("website", e.target.value || null)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={String(form.phone ?? "")}
                onChange={(e) => update("phone", e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                type="tel"
                value={String(form.whatsapp ?? "")}
                onChange={(e) => update("whatsapp", e.target.value || null)}
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
                  className={`rounded-xl px-2.5 py-1 text-xs font-medium ${
                    (form.type as string[])?.includes(t)
                      ? "bg-[var(--brand-primary)] text-[var(--brand-white)]"
                      : "bg-[var(--brand-lilac)] text-[var(--brand-text)]"
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
              value={String(form.cost ?? "consult directly")}
              onChange={(e) => update("cost", e.target.value as CostType)}
              className={inputClass}
            >
              {COST_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
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
                  className={`rounded-xl px-2.5 py-1 text-xs font-medium ${
                    (form.population as string[])?.includes(opt.value)
                      ? "bg-brand-lilac/40 text-[var(--brand-primary)]"
                      : "bg-[var(--brand-lilac)] text-[var(--brand-text)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelClass}>Modalidad</span>
            <p className="mt-1 text-xs text-[var(--brand-text)]">
              Puedes marcar una o ambas.
            </p>
            <div className="mt-1 flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--brand-text)]">
                <input
                  type="checkbox"
                  checked={form.online === true}
                  onChange={(e) => update("online", e.target.checked)}
                  className="rounded-xl border-[var(--brand-lilac)] text-[var(--brand-primary)]"
                />
                En línea
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-[var(--brand-text)]">
                <input
                  type="checkbox"
                  checked={form.inPerson === true}
                  onChange={(e) => update("inPerson", e.target.checked)}
                  className="rounded-xl border-[var(--brand-lilac)] text-[var(--brand-primary)]"
                />
                Presencial
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <ButtonOutline type="button" onClick={onClose} className="text-sm">
              Cancelar
            </ButtonOutline>
            <ButtonSolid type="submit" disabled={saving} className="text-sm">
              {saving ? "Guardando…" : "Guardar"}
            </ButtonSolid>
          </div>
        </form>
      </div>
    </div>
  );
}
