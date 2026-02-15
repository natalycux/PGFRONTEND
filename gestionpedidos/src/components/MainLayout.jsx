import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, LogOut } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-left">
          <div className="header-logo">
            <Droplets size={28} color="white" />
          </div>
          <div className="header-title">
            <h1>Gestión de Pedidos de Agua</h1>
            <p>Sistema de control para la comunidad</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-role">{user?.rol}</span>
            <span className="user-name">{user?.nombre}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <nav className="main-nav">
        {hasPermission('dashboard') && (
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
        )}
        
        {hasPermission('pedidos') && (
          <NavLink to="/pedidos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Pedidos
          </NavLink>
        )}
        
        {hasPermission('usuarios') && (
          <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Usuarios
          </NavLink>
        )}
        
        {hasPermission('bitacora') && (
          <NavLink to="/bitacora" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Bitácora
          </NavLink>
        )}
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
