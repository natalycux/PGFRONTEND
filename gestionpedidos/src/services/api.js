import axios from 'axios';

// Función para generar UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7004';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/api/Auth/login');
      if (!isLoginEndpoint) {
        const token = localStorage.getItem('token');
        console.error('🔴 401 Unauthorized en:', error.config?.url);
        console.error('🔴 Token en localStorage:', token ? `${token.substring(0, 30)}...` : 'NO HAY TOKEN');
        console.error('🔴 Header enviado:', error.config?.headers?.Authorization ? 'presente' : 'AUSENTE');
        console.error('🔴 Respuesta del backend:', error.response?.data);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Usar navigate de React Router evitaría la recarga, pero como el interceptor
        // vive fuera del árbol React, usamos un evento personalizado para que AuthContext
        // maneje el logout y luego React Router navegue suavemente.
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de Autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/Auth/login', { email, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/Auth/validate');
    return response.data;
  }
};

// Servicios de Dashboard
export const dashboardService = {
  getStatistics: async (fechaDesde = null, fechaHasta = null) => {
    const params = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    const response = await api.get('/api/Dashboard', { params });
    return response.data;
  },
  
  getOrdersByCommunity: async () => {
    const response = await api.get('/api/Dashboard/orders-by-community');
    return response.data;
  },
  
  getOrdersByDeliveryPerson: async () => {
    const response = await api.get('/api/Dashboard/orders-by-delivery-person');
    return response.data;
  },
  
  getRecentOrders: async () => {
    const response = await api.get('/api/Dashboard/recent-orders');
    return response.data;
  }
};

// Servicios de Pedidos
export const orderService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/api/Pedidos', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/Pedidos/${id}`);
    return response.data;
  },
  
  create: async (orderData) => {
    const response = await api.post('/api/Pedidos', orderData, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.put(`/api/Pedidos/${id}/estado`, { nuevoEstado: status });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/Pedidos/${id}`);
    return response.data;
  },

  cancelOrder: async (id, motivoCancelacion, idUsuarioEjecutor) => {
    const response = await api.put(`/api/Pedidos/${id}/cancelar`, {
      motivoCancelacion,
      idUsuarioEjecutor
    });
    return response.data;
  }
};

// Servicios de Comunidades
export const communityService = {
  getAll: async () => {
    const response = await api.get('/api/Comunidades');
    return response.data;
  },

  create: async (nombre, idUsuarioCreador) => {
    const response = await api.post('/api/Comunidades', {
      nombreComunidad: nombre,
      idUsuarioCreador: idUsuarioCreador
    }, {
      headers: {
        'Idempotency-Key': generateUUID()
      },
      validateStatus: (status) => status >= 200 && status < 300
    });
    return response.data;
  },

  update: async (id, nombre, idUsuarioModificador) => {
    const response = await api.put(`/api/Comunidades/${id}`, {
      nombreComunidad: nombre,
      idUsuarioModificador: idUsuarioModificador
    }, {
      headers: {
        'Idempotency-Key': generateUUID()
      },
      validateStatus: (status) => status >= 200 && status < 300
    });
    return response.data;
  },

  toggleEstado: async (id, activa) => {
    const response = await api.patch(`/api/Comunidades/${id}/estado`, { activa }, {
      headers: {
        'Idempotency-Key': generateUUID()
      },
      validateStatus: (status) => status >= 200 && status < 300
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/Comunidades/${id}`);
    return response.data;
  }
};

// Servicios de Clientes
export const clientService = {
  getAll: async () => {
    const response = await api.get('/api/Clientes');
    return response.data;
  },

  getByCommunity: async (communityId) => {
    const response = await api.get(`/api/Clientes/comunidad/${communityId}`);
    return response.data;
  },

  create: async (clientData) => {
    const response = await api.post('/api/Clientes', clientData, {
      headers: {
        'Idempotency-Key': generateUUID()
      },
      validateStatus: (status) => status >= 200 && status < 300
    });
    return response.data;
  },

  update: async (id, clientData) => {
    const response = await api.put(`/api/Clientes/${id}`, clientData, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  },

  toggleEstado: async (id, activo) => {
    const response = await api.patch(`/api/Clientes/${id}/estado`, { activo }, {
      headers: {
        'Idempotency-Key': generateUUID()
      },
      validateStatus: (status) => status >= 200 && status < 300
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/Clientes/${id}`);
    return response.data;
  }
};

// Servicios de Usuarios
export const userService = {
  getAll: async () => {
    const response = await api.get('/api/Usuarios');
    return response.data;
  },
  
  create: async (userData) => {
    const response = await api.post('/api/Usuarios', userData, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  },
  
  changePassword: async (userId, newPassword) => {
    const response = await api.put(`/api/Usuarios/${userId}/cambiar-contrasena`, {
      nuevaContrasena: newPassword
    }, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  },
  
  deactivate: async (userId) => {
    const response = await api.put(`/api/Usuarios/${userId}/desactivar`, {}, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  },

  reactivate: async (userId) => {
    const response = await api.put(`/api/Usuarios/${userId}/habilitar`, {}, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  },

  update: async (userId, userData) => {
    const response = await api.put(`/api/Usuarios/${userId}`, userData, {
      headers: {
        'Idempotency-Key': generateUUID()
      }
    });
    return response.data;
  }
};

// Servicios de Bitácora
export const auditLogService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/api/Bitacora', { params: filters });
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get('/api/Bitacora/agrupada');
    return response.data;
  }
};

export default api;
