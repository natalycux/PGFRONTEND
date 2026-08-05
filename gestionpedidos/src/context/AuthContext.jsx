import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { sessionManager } from '../services/sessionManager';

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

  // Escuchar el evento del interceptor cuando el backend devuelve 401
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('⚠️ Sesión expirada o token rechazado por el backend. Cerrando sesión...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Vigila la inactividad del usuario (mouse, teclado, scroll, touch) mientras haya sesión activa
  useEffect(() => {
    if (user) sessionManager.start();
    return () => sessionManager.stop();
  }, [user]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Intentando login con:', email);
      const response = await authService.login(email, password);
      console.log('📥 Respuesta del servidor COMPLETA:', response);
      console.log('📥 Headers de respuesta:', response.headers);
      
      // Soportar ambas estructuras de respuesta
      let token, userData;
      
      // Caso 1: Respuesta con estructura { token, user }
      if (response.token && response.user) {
        token = response.token;
        const roleMap = {
          'Administrador Principal': 1,
          'Administrador 2': 2,
          'Repartidor': 3
        };
        userData = {
          id: response.user.id,
          nombre: response.user.name,
          email: response.user.email,
          rol: response.user.role,
          idRol: roleMap[response.user.role] || 3
        };
      }
      // Caso 2: Respuesta con estructura { idUsuario, nombreCompleto, ... }
      else if (response.idUsuario || response.nombreCompleto) {
        // El token viene en la respuesta también
        token = response.token || response.accessToken;
        userData = {
          id: response.idUsuario,
          nombre: response.nombreCompleto,
          email: response.email,
          rol: response.rol || 'Administrador Sistema',
          idRol: response.idRol || 1
        };
      }
      else {
        console.error('❌ Estructura de respuesta no reconocida:', response);
        return { 
          success: false, 
          error: 'Respuesta del servidor inválida' 
        };
      }
      
      if (!token) {
        console.error('❌ Token no encontrado en la respuesta');
        console.error('Claves disponibles:', Object.keys(response));
        return { 
          success: false, 
          error: 'No se recibió token del servidor' 
        };
      }
      
      console.log('✅ Login exitoso, guardando datos...');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('Usuario:', userData);
      
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
      1: ['dashboard', 'pedidos', 'comunidades', 'clientes', 'usuarios', 'bitacora'],     // Admin Principal - TODO
      2: ['dashboard', 'pedidos', 'comunidades', 'clientes', 'bitacora'],               // Admin Secundario - TODO EXCEPTO usuarios
      3: ['pedidos']                                                                    // Repartidor - Solo pedidos
    };
    
    return permissions[user.idRol]?.includes(permission) || false;
  };

  const isAdmin = () => {
    // Admin Principal (1) o Admin Secundario (2)
    return user && [1, 2].includes(user.idRol);
  };

  const isRepartidor = () => {
    // Solo Repartidor (3)
    return user && user.idRol === 3;
  };

  const canAccessPage = (requiredRole) => {
    // requiredRole puede ser un número o array de números
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.idRol);
    }
    return user.idRol === requiredRole;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isRepartidor,
    canAccessPage,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
