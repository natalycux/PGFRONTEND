import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'https://localhost:7004';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Para desarrollo: ignorar certificados autofirmados
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
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  getStatistics: async () => {
    const response = await api.get('/api/Dashboard');
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
    const response = await api.post('/api/Pedidos', orderData);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.put(`/api/Pedidos/${id}/estado`, { estado: status });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/Pedidos/${id}`);
    return response.data;
  }
};

// Servicios de Comunidades
export const communityService = {
  getAll: async () => {
    const response = await api.get('/api/Clientes/comunidades');
    return response.data;
  }
};

// Servicios de Clientes
export const clientService = {
  getByCommunity: async (comunityId) => {
    const response = await api.get(`/api/Clientes/comunidad/${comunityId}`);
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
    const response = await api.post('/api/Usuarios', userData);
    return response.data;
  },
  
  changePassword: async (userId, newPassword) => {
    const response = await api.post('/api/Auth/change-password', { 
      usuarioId: userId, 
      nuevaContrasena: newPassword 
    });
    return response.data;
  },
  
  deactivate: async (userId) => {
    const response = await api.put(`/api/Usuarios/${userId}/desactivar`);
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
