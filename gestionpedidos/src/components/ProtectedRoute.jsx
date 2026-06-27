// Componente para proteger rutas basado en permisos y rol
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const ProtectedRoute = ({ children, permission, requiredRole }) => {
  const { isAuthenticated, hasPermission, canAccessPage, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Cargando...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Validar permisos por rol si se especifica requiredRole
  if (requiredRole && !canAccessPage(requiredRole)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '20px',
        color: '#dc2626'
      }}>
        <Lock size={64} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Acceso Denegado</h2>
          <p style={{ margin: 0, color: '#64748b' }}>No tienes permisos para acceder a esta sección.</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Tu rol: {user?.rol}</p>
        </div>
      </div>
    );
  }
  
  // Validar permisos específicos si se especifica permission
  if (permission && !hasPermission(permission)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '20px',
        color: '#dc2626'
      }}>
        <Lock size={64} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>Acceso Denegado</h2>
          <p style={{ margin: 0, color: '#64748b' }}>No tienes permisos para esta acción.</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>Tu rol: {user?.rol}</p>
        </div>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;
