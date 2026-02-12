import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Usuarios from './pages/Usuarios';
import Bitacora from './pages/Bitacora';
import './App.css';

// Componente para proteger rutas
const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/pedidos" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute permission="dashboard">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="pedidos" 
          element={
            <ProtectedRoute permission="pedidos">
              <Pedidos />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="usuarios" 
          element={
            <ProtectedRoute permission="usuarios">
              <Usuarios />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="bitacora" 
          element={
            <ProtectedRoute permission="bitacora">
              <Bitacora />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

