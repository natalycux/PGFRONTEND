import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import Comunidades from './pages/Comunidades';
import Clientes from './pages/Clientes';
import Usuarios from './pages/Usuarios';
import Bitacora from './pages/Bitacora';
import './App.css';

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.idRol === 3 ? '/pedidos' : '/dashboard'} replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <DefaultRedirect /> : <Login />}
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultRedirect />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute requiredRole={[1, 2]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="pedidos" 
          element={
            <ProtectedRoute requiredRole={[1, 2, 3]}>
              <Pedidos />
            </ProtectedRoute>
          } 
        />

        <Route
          path="comunidades"
          element={
            <ProtectedRoute requiredRole={[1, 2]}>
              <Comunidades />
            </ProtectedRoute>
          }
        />

        <Route
          path="clientes"
          element={
            <ProtectedRoute requiredRole={[1, 2]}>
              <Clientes />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="usuarios" 
          element={
            <ProtectedRoute requiredRole={[1, 2]}>
              <Usuarios />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="bitacora" 
          element={
            <ProtectedRoute requiredRole={[1, 2]}>
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

