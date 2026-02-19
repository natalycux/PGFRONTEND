import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { UserPlus, Key, UserX, Shield, X } from 'lucide-react';
import './Usuarios.css';

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Repartidor'
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
      setNewUser({ name: '', email: '', password: '', role: 'Repartidor' });
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('Error al crear el usuario');
    }
  };

  const handleChangePassword = async (userId) => {
    const newPassword = prompt('Ingrese la nueva contrasena:');
    if (!newPassword) return;
    try {
      await userService.changePassword(userId, newPassword);
      alert('Contrasena cambiada exitosamente');
    } catch (error) {
      console.error('Error cambiando contrasena:', error);
      alert('Error al cambiar la contrasena');
    }
  };

  const handleDeactivate = async (userId, activo) => {
    if (userId === currentUser.id) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }
    if (!activo) {
      alert('Este usuario ya esta desactivado');
      return;
    }
    if (window.confirm('Estas seguro de desactivar este usuario?')) {
      try {
        await userService.deactivate(userId);
        await loadUsers();
        alert('Usuario desactivado exitosamente');
      } catch (error) {
        console.error('Error desactivando usuario:', error);
        alert('Error al desactivar el usuario');
      }
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
                onClick={() => handleChangePassword(user.idUsuario)}
                className={`action-button change-password${user.activo === false ? ' deactivate-disabled' : ''}`}
                disabled={user.activo === false}
                title={user.activo === false ? 'Usuario desactivado' : 'Cambiar contrasena'}
              >
                <Key size={18} />
                Cambiar Contrasena
              </button>

              {user.idUsuario !== currentUser.id && (
                <button
                  onClick={() => handleDeactivate(user.idUsuario, user.activo)}
                  className={`action-button deactivate${user.activo === false ? ' deactivate-disabled' : ''}`}
                  disabled={user.activo === false}
                  title={user.activo === false ? 'Usuario ya desactivado' : 'Desactivar usuario'}
                >
                  <UserX size={18} />
                  {user.activo === false ? 'Desactivado' : 'Desactivar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  required
                >
                  <option value="Repartidor">Repartidor</option>
                  <option value="AdminSecundario">Administrador 2</option>
                  <option value="AdminPrincipal">Administrador Principal</option>
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
