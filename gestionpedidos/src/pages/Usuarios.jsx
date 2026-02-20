import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { UserPlus, Key, UserX, UserCheck, Pencil, Shield, X, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import './Usuarios.css';

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ userId: null, password: '', confirm: '', showPwd: false, showConfirm: false });
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    nombreCompleto: '',
    email: '',
    password: '',
    idRol: 3
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.create(newUser);
      await loadUsers();
      setShowCreateModal(false);
      setNewUser({ nombreCompleto: '', email: '', password: '', idRol: 3 });
      Swal.fire({ icon: 'success', title: 'Usuario creado', text: 'El usuario fue creado exitosamente.', confirmButtonColor: '#2563eb' });
    } catch (error) {
      console.error('Error creando usuario:', error);
      const msg = error.response?.data?.message ?? 'Ocurrió un error inesperado.';
      Swal.fire({ icon: 'error', title: 'Error al crear', text: msg, confirmButtonColor: '#2563eb' });
    }
  };

  const handleChangePassword = (userId) => {
    setPasswordData({ userId, password: '', confirm: '', showPwd: false, showConfirm: false });
    setShowPasswordModal(true);
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirm) {
      Swal.fire({ icon: 'warning', title: 'Las contraseñas no coinciden', confirmButtonColor: '#2563eb' });
      return;
    }
    try {
      await userService.changePassword(passwordData.userId, passwordData.password);
      setShowPasswordModal(false);
      Swal.fire({ icon: 'success', title: 'Contraseña cambiada', text: 'La contraseña fue actualizada correctamente.', confirmButtonColor: '#2563eb' });
    } catch (error) {
      console.error('Error cambiando contrasena:', error);
      const msg = error.response?.data?.message ?? 'Ocurrió un error inesperado.';
      Swal.fire({ icon: 'error', title: 'Error al cambiar contraseña', text: msg, confirmButtonColor: '#2563eb' });
    }
  };

  const handleDeactivate = async (userId, activo) => {
    if (userId === currentUser.id) {
      Swal.fire({ icon: 'warning', title: 'Acción no permitida', text: 'No puedes desactivar tu propia cuenta.', confirmButtonColor: '#2563eb' });
      return;
    }
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar usuario?',
      text: 'El usuario no podrá iniciar sesión hasta ser reactivado.',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });
    if (!result.isConfirmed) return;
    try {
      await userService.deactivate(userId);
      await loadUsers();
      Swal.fire({ icon: 'success', title: 'Usuario desactivado', confirmButtonColor: '#2563eb' });
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      Swal.fire({ icon: 'error', title: 'Error al desactivar', text: error.response?.data?.message ?? 'Ocurrió un error inesperado.', confirmButtonColor: '#2563eb' });
    }
  };

  const handleReactivate = async (userId) => {
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Reactivar usuario?',
      text: 'El usuario podrá iniciar sesión nuevamente.',
      showCancelButton: true,
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#15803d',
      cancelButtonColor: '#64748b'
    });
    if (!result.isConfirmed) return;
    try {
      await userService.reactivate(userId);
      await loadUsers();
      Swal.fire({ icon: 'success', title: 'Usuario reactivado', confirmButtonColor: '#2563eb' });
    } catch (error) {
      console.error('Error reactivando usuario:', error);
      Swal.fire({ icon: 'error', title: 'Error al reactivar', text: error.response?.data?.message ?? 'Ocurrió un error inesperado.', confirmButtonColor: '#2563eb' });
    }
  };

  const handleOpenEdit = (user) => {
    setEditUser({
      idUsuario: user.idUsuario,
      nombreCompleto: user.nombreCompleto,
      email: user.email,
      idRol: user.idRol ?? 3
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await userService.update(editUser.idUsuario, {
        nombreCompleto: editUser.nombreCompleto,
        email: editUser.email,
        idRol: editUser.idRol
      });
      await loadUsers();
      setShowEditModal(false);
      setEditUser(null);
      Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: 'Los datos fueron guardados correctamente.', confirmButtonColor: '#2563eb' });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      Swal.fire({ icon: 'error', title: 'Error al actualizar', text: error.response?.data?.message ?? 'Ocurrió un error inesperado.', confirmButtonColor: '#2563eb' });
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'AdminPrincipal': { class: 'admin-principal', icon: <Shield size={14} />, text: 'Administrador Principal' },
      'AdminSecundario': { class: 'admin-2', icon: <Shield size={14} />, text: 'Administrador 2' },
      'Repartidor': { class: 'repartidor', icon: '', text: 'Repartidor' }
    };
    const badge = badges[role] || { class: '', icon: '', text: role };
    return (
      <span className={`role-badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion de Usuarios</h1>
          <p className="page-subtitle">Administra usuarios del sistema</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="create-user-button">
          <UserPlus size={20} />
          Crear Usuario
        </button>
      </div>

      <div className="users-count">
        <h3>Usuarios Registrados ({users.length}) &middot; Activos: {users.filter(u => u.activo !== false).length}</h3>
      </div>

      <div className="users-list">
        {users.map((user) => (
          <div key={user.idUsuario} className={`user-card${user.activo === false ? ' user-card-inactive' : ''}`}>
            <div className="user-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="user-name">{user.nombreCompleto}</h3>
                {user.idUsuario === currentUser.id && (
                  <span className="current-user-badge">Tu</span>
                )}
                {user.activo === false && (
                  <span className="inactive-badge">Desactivado</span>
                )}
              </div>
              {getRoleBadge(user.rol)}
            </div>

            <div className="user-info">
              <p className="user-email">{user.email}</p>
              <p className="user-created">Creado: {new Date(user.fechaCreacion).toLocaleDateString('es-ES')}</p>
            </div>

            <div className="user-actions">
              <button
                onClick={() => handleOpenEdit(user)}
                className="action-button edit"
                title="Editar usuario"
              >
                <Pencil size={18} />
                Editar
              </button>

              <button
                onClick={() => handleChangePassword(user.idUsuario)}
                className={`action-button change-password${user.activo === false ? ' deactivate-disabled' : ''}`}
                disabled={user.activo === false}
                title={user.activo === false ? 'Usuario desactivado' : 'Cambiar contrasena'}
              >
                <Key size={18} />
                Cambiar Contrasena
              </button>

              {user.idUsuario !== currentUser.id && (
                user.activo === false ? (
                  <button
                    onClick={() => handleReactivate(user.idUsuario)}
                    className="action-button reactivate"
                    title="Reactivar usuario"
                  >
                    <UserCheck size={18} />
                    Reactivar
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeactivate(user.idUsuario, user.activo)}
                    className="action-button deactivate"
                    title="Desactivar usuario"
                  >
                    <UserX size={18} />
                    Desactivar
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPassword} className="user-form">
              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <div className="input-password-wrapper">
                  <input
                    type={passwordData.showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setPasswordData({ ...passwordData, showPwd: !passwordData.showPwd })}
                  >
                    {passwordData.showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <div className="input-password-wrapper">
                  <input
                    type={passwordData.showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })}
                  >
                    {passwordData.showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button onClick={() => setShowEditModal(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="user-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={editUser.nombreCompleto}
                  onChange={(e) => setEditUser({ ...editUser, nombreCompleto: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electronico *</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={editUser.idRol}
                  onChange={(e) => setEditUser({ ...editUser, idRol: parseInt(e.target.value) })}
                  required
                >
                  <option value={3}>Repartidor</option>
                  <option value={2}>Administrador Secundario</option>
                  <option value={1}>Administrador Principal</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Perez"
                  value={newUser.nombreCompleto}
                  onChange={(e) => setNewUser({ ...newUser, nombreCompleto: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo Electronico *</label>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contrasena *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={newUser.idRol}
                  onChange={(e) => setNewUser({ ...newUser, idRol: parseInt(e.target.value) })}
                  required
                >
                  <option value={3}>Repartidor</option>
                  <option value={2}>Administrador Secundario</option>
                  <option value={1}>Administrador Principal</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
