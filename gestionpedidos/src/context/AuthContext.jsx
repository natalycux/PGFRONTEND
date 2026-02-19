import { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Inicializar el estado desde localStorage
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && savedUser !== 'undefined' && token) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Error al cargar usuario desde localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    return null;
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      console.log('🔐 Intentando login con:', email);
      const response = await authService.login(email, password);
      console.log('📥 Respuesta del servidor:', response);
      
      const { token, idusuario, nombreCompleto, email: userEmail, rol, idRol } = response;
      
      if (!token) {
        console.error('❌ Respuesta inválida - token faltante');
        return { 
          success: false, 
          error: 'Respuesta del servidor inválida' 
        };
      }
      
      // Crear objeto de usuario con la estructura de la API
      const userData = {
        id: idusuario,
        nombre: nombreCompleto,
        email: userEmail,
        rol: rol,
        idRol: idRol
      };
      
      console.log('✅ Login exitoso, guardando datos...');
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      console.log('✅ Usuario actualizado, redirigiendo...');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('❌ Detalles:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Verificar permisos por rol
  const hasPermission = (permission) => {
    if (!user) return false;
    
    const permissions = {
      'AdminPrincipal': ['dashboard', 'pedidos', 'comunidades', 'clientes', 'usuarios', 'bitacora', 'crear_usuario', 'eliminar_pedido', 'cambiar_password', 'desactivar_usuario'],
      'AdminSecundario': ['dashboard', 'pedidos', 'comunidades', 'clientes', 'bitacora', 'eliminar_pedido'],
      'Repartidor': ['pedidos', 'crear_pedido']
    };
    
    return permissions[user.rol]?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
