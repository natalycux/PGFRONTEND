import { useState, useEffect, useRef } from 'react';
import { communityService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, X, Save, Pencil, XCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import './Comunidades.css';

const Comunidades = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
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

  // Toggle estado (desactivar / activar)
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  // Foco automático al abrir form
  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  const load = async () => {
    try {
      const [commData, usersData] = await Promise.all([
        communityService.getAll(),
        userService.getAll()
      ]);
      setCommunities(commData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error cargando comunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    if (!id) return '—';
    const u = users.find(u =>
      (u.idUsuario ?? u.id ?? u.idusuario) === id ||
      String(u.idUsuario ?? u.id ?? u.idusuario) === String(id)
    );
    return u ? (u.nombreCompleto ?? u.nombre ?? u.name ?? `Usuario ${id}`) : `Usuario ${id}`;
  };

  // ── Crear ──────────────────────────────────────────────────────
  const openForm = () => {
    setShowForm(true);
    setNewName('');
    setCreateError('');
    setEditingId(null);
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
      await communityService.create(newName.trim(), user?.id);
      await load();
      closeForm();
      Swal.fire({
        icon: 'success',
        title: '¡Comunidad creada!',
        text: `"${newName.trim()}" fue registrada exitosamente.`,
        confirmButtonColor: '#2563eb',
        timer: 2500,
        timerProgressBar: true
      });
    } catch (err) {
      try {
        const data = await communityService.getAll();
        const wasCreated = data.some(
          (c) => c.nombreComunidad?.toLowerCase() === newName.trim().toLowerCase()
        );
        if (wasCreated) {
          setCommunities(data);
          closeForm();
          Swal.fire({
            icon: 'success',
            title: '¡Comunidad creada!',
            text: `"${newName.trim()}" fue registrada exitosamente.`,
            confirmButtonColor: '#2563eb',
            timer: 2500,
            timerProgressBar: true
          });
          return;
        }
      } catch (_) { /* mostrar error original */ }

      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Error al crear la comunidad.';
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Editar ─────────────────────────────────────────────────────
  const startEdit = (community) => {
    setEditingId(community.idComunidad);
    setEditName(community.nombreComunidad);
    setEditError('');
    setShowForm(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditName(''); setEditError(''); };

  const handleUpdate = async (id) => {
    if (!editName.trim()) { setEditError('El nombre es obligatorio.'); return; }
    setEditLoading(true);
    try {
      await communityService.update(id, editName.trim(), user?.id);
      await load();
      cancelEdit();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Error al actualizar.';
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Toggle estado ──────────────────────────────────────────────
  const handleToggle = async (community) => {
    const nuevaActiva = !community.activa;
    const accion = nuevaActiva ? 'activar' : 'desactivar';
    const accionPasado = nuevaActiva ? 'activada' : 'desactivada';

    const result = await Swal.fire({
      title: `¿${nuevaActiva ? 'Activar' : 'Desactivar'} comunidad?`,
      text: `"${community.nombreComunidad}" será ${accionPasado}.`,
      icon: nuevaActiva ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: nuevaActiva ? '#16a34a' : '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setToggleLoading(true);
    try {
      await communityService.toggleEstado(community.idComunidad, nuevaActiva);
      await load();
      Swal.fire({
        icon: 'success',
        title: nuevaActiva ? '¡Comunidad activada!' : '¡Comunidad desactivada!',
        text: `"${community.nombreComunidad}" fue ${accionPasado} exitosamente.`,
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error cambiando estado de comunidad:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.', confirmButtonColor: '#2563eb' });
    } finally {
      setToggleLoading(false);
    }
  };

  const activeCount   = communities.filter(c => c.activa).length;
  const inactiveCount = communities.filter(c => !c.activa).length;

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

      {/* ── Stat cards ── */}
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
        <div className="com-stat-card">
          <div className="com-stat-icon com-stat-icon--green">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="com-stat-label">Activas</p>
            <p className="com-stat-value">{activeCount}</p>
          </div>
        </div>
        <div className="com-stat-card">
          <div className="com-stat-icon com-stat-icon--gray">
            <XCircle size={22} />
          </div>
          <div>
            <p className="com-stat-label">Inactivas</p>
            <p className="com-stat-value">{inactiveCount}</p>
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
                  <div className={`com-table-row${!c.activa ? ' com-row--inactive' : ''}`}>
                    <div className="com-cell-name">
                      <div className={`com-community-icon${!c.activa ? ' com-community-icon--inactive' : ''}`}>
                        <Building2 size={17} />
                      </div>
                      <span className="com-community-name">{c.nombreComunidad}</span>
                      {c.activa
                        ? <span className="com-badge com-badge--active">Activa</span>
                        : <span className="com-badge com-badge--inactive">Inactiva</span>
                      }
                    </div>
                    <span className="com-cell">{c.creadoPor || c.nombreCreador || getUserName(c.idUsuarioCreador ?? c.id_usuario_creador)}</span>
                    <span className="com-cell">
                      {c.fechaCreacion
                        ? new Date(c.fechaCreacion).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '—'}
                    </span>
                    <div className="com-cell-actions">
                      {c.activa && (
                        <button
                          className="com-icon-btn com-icon-edit"
                          title="Editar"
                          onClick={() => startEdit(c)}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {c.activa ? (
                        <button
                          className="com-icon-btn com-icon-delete"
                          title="Desactivar comunidad"
                          onClick={() => handleToggle(c)}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          className="com-icon-btn com-icon-activate"
                          title="Activar comunidad"
                          onClick={() => handleToggle(c)}
                        >
                          <CheckCircle size={16} />
                        </button>
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
                    <span className="com-cell">{c.creadoPor || c.nombreCreador || getUserName(c.idUsuarioCreador ?? c.id_usuario_creador)}</span>
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
