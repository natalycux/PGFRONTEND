import { useState, useEffect, useRef } from 'react';
import { communityService } from '../services/api';
import { Building2, Plus, X, Save, Pencil, Trash2, AlertCircle } from 'lucide-react';
import './Comunidades.css';

const Comunidades = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Crear
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const inputRef = useRef(null);

  // Editar
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Eliminar – confirm inline
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  // Foco automático al abrir form
  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  const load = async () => {
    try {
      const data = await communityService.getAll();
      setCommunities(data);
    } catch (err) {
      console.error('Error cargando comunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Crear ──────────────────────────────────────────────────────
  const openForm = () => {
    setShowForm(true);
    setNewName('');
    setCreateError('');
    setEditingId(null);
    setDeletingId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setNewName('');
    setCreateError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { setCreateError('El nombre es obligatorio.'); return; }
    setCreateLoading(true);
    try {
      await communityService.create(newName.trim());
      await load();
      closeForm();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error al crear la comunidad.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Editar ─────────────────────────────────────────────────────
  const startEdit = (community) => {
    setEditingId(community.idComunidad);
    setEditName(community.nombreComunidad);
    setEditError('');
    setDeletingId(null);
    setShowForm(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditName(''); setEditError(''); };

  const handleUpdate = async (id) => {
    if (!editName.trim()) { setEditError('El nombre es obligatorio.'); return; }
    setEditLoading(true);
    try {
      await communityService.update(id, editName.trim());
      await load();
      cancelEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Eliminar ───────────────────────────────────────────────────
  const startDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
    setShowForm(false);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await communityService.delete(id);
      await load();
      setDeletingId(null);
    } catch (err) {
      console.error('Error eliminando comunidad:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando comunidades...</div>;

  return (
    <div className="comunidades-page">

      {/* ── Encabezado ── */}
      <div className="com-page-header">
        <div>
          <h1 className="com-page-title">Gestión de Comunidades</h1>
          <p className="com-page-subtitle">Administra las comunidades del sistema</p>
        </div>
        {!showForm ? (
          <button className="com-btn-primary" onClick={openForm}>
            <Plus size={18} />
            Nueva Comunidad
          </button>
        ) : (
          <button className="com-btn-cancel-header" onClick={closeForm}>
            <X size={18} />
            Cancelar
          </button>
        )}
      </div>

      {/* ── Stat card ── */}
      <div className="com-stats-row">
        <div className="com-stat-card">
          <div className="com-stat-icon">
            <Building2 size={22} />
          </div>
          <div>
            <p className="com-stat-label">Total Comunidades</p>
            <p className="com-stat-value">{communities.length}</p>
          </div>
        </div>
      </div>

      {/* ── Formulario crear ── */}
      {showForm && (
        <div className="com-form-card">
          <h3 className="com-form-title">Crear Nueva Comunidad</h3>
          <form onSubmit={handleCreate}>
            <label className="com-field-label">
              Nombre de la Comunidad <span className="required">*</span>
            </label>
            <input
              ref={inputRef}
              className={`com-input${createError ? ' com-input--error' : ''}`}
              type="text"
              placeholder="Ej: Colonia Centro, Fraccionamiento Los Pinos, etc."
              value={newName}
              onChange={(e) => { setNewName(e.target.value); if (e.target.value.trim()) setCreateError(''); }}
            />
            {createError && <p className="com-field-error">{createError}</p>}
            <div className="com-form-actions">
              <button type="submit" className="com-btn-save" disabled={createLoading}>
                <Save size={16} />
                {createLoading ? 'Creando...' : 'Crear Comunidad'}
              </button>
              <button type="button" className="com-btn-secondary" onClick={closeForm} disabled={createLoading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="com-table-card">
        <div className="com-table-header">
          <span>COMUNIDAD</span>
          <span>CREADA POR</span>
          <span>FECHA DE CREACIÓN</span>
          <span className="col-acciones">ACCIONES</span>
        </div>

        {communities.length === 0 ? (
          <div className="com-empty-state">
            <Building2 size={48} className="com-empty-icon" />
            <p className="com-empty-title">No hay comunidades registradas</p>
            <p className="com-empty-sub">Crea la primera comunidad para comenzar</p>
          </div>
        ) : (
          <div className="com-table-body">
            {communities.map((c) => (
              <div key={c.idComunidad}>
                {/* Fila normal */}
                {editingId !== c.idComunidad && (
                  <div className={`com-table-row${deletingId === c.idComunidad ? ' com-row--deleting' : ''}`}>
                    <div className="com-cell-name">
                      <div className="com-community-icon">
                        <Building2 size={17} />
                      </div>
                      <span className="com-community-name">{c.nombreComunidad}</span>
                    </div>
                    <span className="com-cell">{c.creadoPor || c.nombreCreador || '—'}</span>
                    <span className="com-cell">
                      {c.fechaCreacion
                        ? new Date(c.fechaCreacion).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '—'}
                    </span>
                    <div className="com-cell-actions">
                      {deletingId !== c.idComunidad ? (
                        <>
                          <button
                            className="com-icon-btn com-icon-edit"
                            title="Editar"
                            onClick={() => startEdit(c)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="com-icon-btn com-icon-delete"
                            title="Eliminar"
                            onClick={() => startDelete(c.idComunidad)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="com-confirm-delete">
                          <AlertCircle size={15} />
                          <span>¿Eliminar?</span>
                          <button
                            className="com-confirm-yes"
                            onClick={() => handleDelete(c.idComunidad)}
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? '...' : 'Sí'}
                          </button>
                          <button className="com-confirm-no" onClick={cancelDelete} disabled={deleteLoading}>
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fila en modo edición */}
                {editingId === c.idComunidad && (
                  <div className="com-table-row com-row--editing">
                    <div className="com-edit-inline">
                      <input
                        className={`com-input com-input--inline${editError ? ' com-input--error' : ''}`}
                        value={editName}
                        onChange={(e) => { setEditName(e.target.value); if (e.target.value.trim()) setEditError(''); }}
                        autoFocus
                      />
                      {editError && <p className="com-field-error">{editError}</p>}
                    </div>
                    <span className="com-cell">{c.creadoPor || c.nombreCreador || '—'}</span>
                    <span className="com-cell">
                      {c.fechaCreacion
                        ? new Date(c.fechaCreacion).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '—'}
                    </span>
                    <div className="com-cell-actions">
                      <button
                        className="com-btn-save-inline"
                        onClick={() => handleUpdate(c.idComunidad)}
                        disabled={editLoading}
                      >
                        <Save size={14} />
                        {editLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button className="com-btn-cancel-inline" onClick={cancelEdit} disabled={editLoading}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comunidades;
