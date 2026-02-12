// Componente para proteger rutas basado en permisos
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();
  
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
  
  if (permission && !hasPermission(permission)) {
    // Si no tiene permiso, redirigir al pedidos (disponible para todos)
    return <Navigate to="/pedidos" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
