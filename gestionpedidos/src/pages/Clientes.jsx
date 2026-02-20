import { useState, useEffect, useRef } from 'react';
import { clientService, communityService } from '../services/api';
import { Users, Building2, Phone, Plus, X, Save, Pencil, XCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import './Clientes.css';

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCommunity, setFilterCommunity] = useState('');

  // Formulario crear
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', communityId: '', telefono: '', direccion: '' });
  const [formErrors, setFormErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const nameInputRef = useRef(null);

  // Edición inline
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Toggle estado
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (showForm && nameInputRef.current) nameInputRef.current.focus();
  }, [showForm]);

  const loadAll = async () => {
    try {
      const [clientsData, communitiesData] = await Promise.all([
        clientService.getAll(),
        communityService.getAll()
      ]);
      setClients(clientsData);
      setCommunities(communitiesData);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────
  const totalClients  = clients.length;
  const activeClients = clients.filter(c => c.activo || c.activa).length;
  const activeCommunities = new Set(clients.map(c => c.idComunidad).filter(Boolean)).size;
  const withPhone = clients.filter(c => c.telefono?.trim()).length;

  // Comunidades activas (para los formularios)
  const activeCommunityList = communities.filter(c => c.activa);

  // ── Filtrado ───────────────────────────────────────────────────
  const filtered = filterCommunity
    ? clients.filter(c => String(c.idComunidad) === filterCommunity)
    : clients;

  // ── Crear ──────────────────────────────────────────────────────
  const openForm = () => {
    setShowForm(true);
    setFormData({ nombre: '', communityId: '', telefono: '', direccion: '' });
    setFormErrors({});
    setEditingId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({ nombre: '', communityId: '', telefono: '', direccion: '' });
    setFormErrors({});
  };

  const validateForm = (data) => {
    const errs = {};
    if (!data.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!data.communityId) errs.communityId = 'Selecciona una comunidad.';
    return errs;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setCreateLoading(true);
    try {
      await clientService.create({
        nombreCompleto: formData.nombre.trim(),
        idComunidad: parseInt(formData.communityId),
        telefono: formData.telefono.trim() || null,
        direccionDetallada: formData.direccion.trim() || null
      });
      await loadAll();
      closeForm();
      Swal.fire({
        icon: 'success',
        title: '¡Cliente creado!',
        text: `"${formData.nombre.trim()}" fue registrado exitosamente.`,
        confirmButtonColor: '#2563eb',
        timer: 2500,
        timerProgressBar: true
      });
    } catch (err) {
      // El backend puede insertar correctamente pero fallar al serializar la respuesta (500).
      // Recargamos y verificamos si el cliente fue creado.
      try {
        const [clientsData, communitiesData] = await Promise.all([
          clientService.getAll(),
          communityService.getAll()
        ]);
        const nombreBuscado = formData.nombre.trim().toLowerCase();
        const wasCreated = clientsData.some(
          (c) => c.nombreCompleto?.toLowerCase() === nombreBuscado &&
                 String(c.idComunidad) === String(formData.communityId)
        );
        if (wasCreated) {
          setClients(clientsData);
          setCommunities(communitiesData);
          closeForm();
          Swal.fire({
            icon: 'success',
            title: '¡Cliente creado!',
            text: `"${formData.nombre.trim()}" fue registrado exitosamente.`,
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
        'Error al crear el cliente.';
      setFormErrors({ general: msg });
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Editar ─────────────────────────────────────────────────────
  const startEdit = (client) => {
    setEditingId(client.idCliente);
    setEditData({
      nombre: client.nombreCompleto || '',
      communityId: String(client.idComunidad || ''),
      telefono: client.telefono || '',
      direccion: client.direccionDetallada || ''
    });
    setEditErrors({});
    setShowForm(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); setEditErrors({}); };

  const handleUpdate = async (id) => {
    const errs = validateForm(editData);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditLoading(true);
    try {
      await clientService.update(id, {
        nombreCompleto: editData.nombre.trim(),
        idComunidad: parseInt(editData.communityId),
        telefono: editData.telefono.trim() || null,
        direccionDetallada: editData.direccion.trim() || null
      });
      await loadAll();
      cancelEdit();
    } catch (err) {
      setEditErrors({ general: err.response?.data?.message || 'Error al actualizar.' });
    } finally {
      setEditLoading(false);
    }
  };

  // ── Toggle estado ──────────────────────────────────────────
  const handleToggle = async (client) => {
    const estaActivo = Boolean(client.activo ?? client.activa ?? true);
    const accion = estaActivo ? 'desactivar' : 'activar';
    const accionPasado = estaActivo ? 'desactivado' : 'activado';

    const result = await Swal.fire({
      title: `¿${estaActivo ? 'Desactivar' : 'Activar'} cliente?`,
      text: `"${client.nombreCompleto}" será ${accionPasado}.`,
      icon: estaActivo ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: estaActivo ? '#e11d48' : '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setToggleLoading(true);
    try {
      await clientService.toggleEstado(client.idCliente, !estaActivo);
      await loadAll();
      Swal.fire({
        icon: 'success',
        title: estaActivo ? '¡Cliente desactivado!' : '¡Cliente activado!',
        text: `"${client.nombreCompleto}" fue ${accionPasado} exitosamente.`,
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error cambiando estado de cliente:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.', confirmButtonColor: '#2563eb' });
    } finally {
      setToggleLoading(false);
    }
  };

  const getCommunityName = (id) =>
    communities.find(c => c.idComunidad === id)?.nombreComunidad || 'Sin comunidad';

  if (loading) return <div className="loading">Cargando clientes...</div>;

  return (
    <div className="clientes-page">

      {/* ── Encabezado ── */}
      <div className="cli-page-header">
        <div>
          <h1 className="cli-page-title">Gestión de Clientes</h1>
          <p className="cli-page-subtitle">Administra los clientes del sistema</p>
        </div>
        {!showForm ? (
          <button className="cli-btn-primary" onClick={openForm}>
            <Plus size={18} />
            Nuevo Cliente
          </button>
        ) : (
          <button className="cli-btn-cancel-header" onClick={closeForm}>
            <X size={18} />
            Cancelar
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="cli-stats-row">
        <div className="cli-stat-card">
          <div className="cli-stat-icon cli-icon-blue">
            <Users size={22} />
          </div>
          <div>
            <p className="cli-stat-label">Total Clientes</p>
            <p className="cli-stat-value">{totalClients}</p>
          </div>
        </div>
        <div className="cli-stat-card">
          <div className="cli-stat-icon cli-icon-green">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="cli-stat-label">Activos</p>
            <p className="cli-stat-value">{activeClients}</p>
          </div>
        </div>
        <div className="cli-stat-card">
          <div className="cli-stat-icon cli-icon-green">
            <Building2 size={22} />
          </div>
          <div>
            <p className="cli-stat-label">Comunidades Activas</p>
            <p className="cli-stat-value">{activeCommunities}</p>
          </div>
        </div>
        <div className="cli-stat-card">
          <div className="cli-stat-icon cli-icon-purple">
            <Phone size={22} />
          </div>
          <div>
            <p className="cli-stat-label">Con Teléfono</p>
            <p className="cli-stat-value">{withPhone}</p>
          </div>
        </div>
      </div>

      {/* ── Formulario crear ── */}
      {showForm && (
        <div className="cli-form-card">
          <h3 className="cli-form-title">Crear Nuevo Cliente</h3>
          <form onSubmit={handleCreate}>
            <div className="cli-form-grid">
              <div className="cli-field">
                <label className="cli-field-label">
                  Nombre del Cliente <span className="required">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  className={`cli-input${formErrors.nombre ? ' cli-input--error' : ''}`}
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => { setFormData({ ...formData, nombre: e.target.value }); setFormErrors({ ...formErrors, nombre: '' }); }}
                />
                {formErrors.nombre && <p className="cli-field-error">{formErrors.nombre}</p>}
              </div>

              <div className="cli-field">
                <label className="cli-field-label">
                  Comunidad <span className="required">*</span>
                </label>
                <select
                  className={`cli-input${formErrors.communityId ? ' cli-input--error' : ''}`}
                  value={formData.communityId}
                  onChange={(e) => { setFormData({ ...formData, communityId: e.target.value }); setFormErrors({ ...formErrors, communityId: '' }); }}
                >
                  <option value="">Selecciona una comunidad</option>
                  {activeCommunityList.map(c => (
                    <option key={c.idComunidad} value={c.idComunidad}>{c.nombreComunidad}</option>
                  ))}
                </select>
                {formErrors.communityId && <p className="cli-field-error">{formErrors.communityId}</p>}
              </div>

              <div className="cli-field">
                <label className="cli-field-label">Teléfono (Opcional)</label>
                <input
                  className="cli-input"
                  type="text"
                  placeholder="Ej: 555-1234"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="cli-field">
                <label className="cli-field-label">Dirección (Opcional)</label>
                <input
                  className="cli-input"
                  type="text"
                  placeholder="Ej: Calle Principal #123"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
            </div>

            {formErrors.general && (
              <p className="cli-field-error" style={{ marginTop: 8 }}>{formErrors.general}</p>
            )}

            <div className="cli-form-actions">
              <button type="submit" className="cli-btn-save" disabled={createLoading}>
                <Save size={16} />
                {createLoading ? 'Creando...' : 'Crear Cliente'}
              </button>
              <button type="button" className="cli-btn-secondary" onClick={closeForm} disabled={createLoading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filtro ── */}
      <div className="cli-filter-bar">
        <Building2 size={18} className="cli-filter-icon" />
        <span className="cli-filter-label">Filtrar por Comunidad:</span>
        <select
          className="cli-filter-select"
          value={filterCommunity}
          onChange={(e) => setFilterCommunity(e.target.value)}
        >
          <option value="">Todas las comunidades</option>
          {communities.map(c => (
            <option key={c.idComunidad} value={c.idComunidad}>{c.nombreComunidad}</option>
          ))}
        </select>
      </div>

      {/* ── Tabla ── */}
      <div className="cli-table-card">
        <div className="cli-table-header">
          <span>CLIENTE</span>
          <span>COMUNIDAD</span>
          <span>TELÉFONO</span>
          <span>DIRECCIÓN</span>
          <span className="col-acciones">ACCIONES</span>
        </div>

        {filtered.length === 0 ? (
          <div className="cli-empty-state">
            <Users size={48} className="cli-empty-icon" />
            <p className="cli-empty-title">No hay clientes registrados</p>
            <p className="cli-empty-sub">Crea el primer cliente para comenzar</p>
          </div>
        ) : (
          <div className="cli-table-body">
            {filtered.map((client) => (
              <div key={client.idCliente}>

                {/* Fila normal */}
                {editingId !== client.idCliente && (() => {
                  const isActive = Boolean(client.activo ?? client.activa ?? true);
                  return (
                  <div className={`cli-table-row${!isActive ? ' cli-row--inactive' : ''}`}>
                    <div className="cli-cell-name">
                      <div className={`cli-client-icon${!isActive ? ' cli-client-icon--inactive' : ''}`}>
                        <Users size={16} />
                      </div>
                      <span className="cli-client-name">{client.nombreCompleto}</span>
                      {isActive
                        ? <span className="cli-badge cli-badge--active">Activo</span>
                        : <span className="cli-badge cli-badge--inactive">Inactivo</span>
                      }
                    </div>
                    <span className="cli-cell">{getCommunityName(client.idComunidad)}</span>
                    <span className="cli-cell">{client.telefono || '—'}</span>
                    <span className="cli-cell cli-cell-dir">{client.direccionDetallada || '—'}</span>
                    <div className="cli-cell-actions">
                      {isActive && (
                        <button className="cli-icon-btn cli-icon-edit" title="Editar" onClick={() => startEdit(client)}>
                          <Pencil size={16} />
                        </button>
                      )}
                      {isActive ? (
                        <button className="cli-icon-btn cli-icon-delete" title="Desactivar cliente" onClick={() => handleToggle(client)}>
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button className="cli-icon-btn cli-icon-activate" title="Activar cliente" onClick={() => handleToggle(client)}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })()}

                {/* Fila editando */}
                {editingId === client.idCliente && (
                  <div className="cli-table-row cli-row--editing">
                    <div className="cli-edit-cell">
                      <input
                        className={`cli-input cli-input--inline${editErrors.nombre ? ' cli-input--error' : ''}`}
                        placeholder="Nombre"
                        value={editData.nombre}
                        onChange={(e) => { setEditData({ ...editData, nombre: e.target.value }); setEditErrors({ ...editErrors, nombre: '' }); }}
                        autoFocus
                      />
                      {editErrors.nombre && <p className="cli-field-error">{editErrors.nombre}</p>}
                    </div>
                    <div className="cli-edit-cell">
                      <select
                        className={`cli-input cli-input--inline${editErrors.communityId ? ' cli-input--error' : ''}`}
                        value={editData.communityId}
                        onChange={(e) => { setEditData({ ...editData, communityId: e.target.value }); setEditErrors({ ...editErrors, communityId: '' }); }}
                      >
                        <option value="">Comunidad...</option>
                        {activeCommunityList.map(c => (
                          <option key={c.idComunidad} value={c.idComunidad}>{c.nombreComunidad}</option>
                        ))}
                      </select>
                      {editErrors.communityId && <p className="cli-field-error">{editErrors.communityId}</p>}
                    </div>
                    <div className="cli-edit-cell">
                      <input
                        className="cli-input cli-input--inline"
                        placeholder="Teléfono"
                        value={editData.telefono}
                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                      />
                    </div>
                    <div className="cli-edit-cell">
                      <input
                        className="cli-input cli-input--inline"
                        placeholder="Dirección"
                        value={editData.direccion}
                        onChange={(e) => setEditData({ ...editData, direccion: e.target.value })}
                      />
                      {editErrors.general && <p className="cli-field-error">{editErrors.general}</p>}
                    </div>
                    <div className="cli-cell-actions">
                      <button className="cli-btn-save-inline" onClick={() => handleUpdate(client.idCliente)} disabled={editLoading}>
                        <Save size={13} />
                        {editLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button className="cli-btn-cancel-inline" onClick={cancelEdit} disabled={editLoading}>Cancelar</button>
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

export default Clientes;
