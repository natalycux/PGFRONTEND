import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'https://localhost:7004/api';

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
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Servicios de Dashboard
export const dashboardService = {
  getStatistics: async () => {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  },
  
  getOrdersByCommunity: async () => {
    const response = await api.get('/dashboard/orders-by-community');
    return response.data;
  },
  
  getOrdersByDeliveryPerson: async () => {
    const response = await api.get('/dashboard/orders-by-delivery-person');
    return response.data;
  },
  
  getRecentOrders: async () => {
    const response = await api.get('/dashboard/recent-orders');
    return response.data;
  }
};

// Servicios de Pedidos
export const orderService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  }
};

// Servicios de Comunidades
export const communityService = {
  getAll: async () => {
    const response = await api.get('/communities');
    return response.data;
  }
};

// Servicios de Clientes
export const clientService = {
  getByCommunity: async (communityId) => {
    const response = await api.get(`/clients/by-community/${communityId}`);
    return response.data;
  }
};

// Servicios de Usuarios
export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  changePassword: async (userId, newPassword) => {
    const response = await api.patch(`/users/${userId}/password`, { password: newPassword });
    return response.data;
  },
  
  deactivate: async (userId) => {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
  }
};

// Servicios de Bitácora
export const auditLogService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/audit-logs', { params: filters });
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get('/audit-logs/statistics');
    return response.data;
  }
};

export default api;
