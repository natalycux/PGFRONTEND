import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  orderService, 
  communityService, 
  clientService 
} from '../services/api';
import { Plus, MapPin, Phone, Calendar, Trash2, Droplets } from 'lucide-react';
import './Pedidos.css';

const Pedidos = () => {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  
  // Form state
  const [formData, setFormData] = useState({
    communityId: '',
    clientId: '',
    transactionType: 'Venta',
    bottles: 1,
    discount: 0,
    initialStatus: 'Pendiente',
    notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [ordersData, communitiesData] = await Promise.all([
        orderService.getAll(),
        communityService.getAll()
      ]);
      setOrders(ordersData);
      setCommunities(communitiesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityChange = async (e) => {
    const communityId = e.target.value;
    setFormData({ ...formData, communityId, clientId: '' });
    
    if (communityId) {
      try {
        const clientsData = await clientService.getByCommunity(communityId);
        setClients(clientsData);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    } else {
      setClients([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await orderService.create(formData);
      await loadInitialData();
      
      // Reset form
      setFormData({
        communityId: '',
        clientId: '',
        transactionType: 'Venta',
        bottles: 1,
        discount: 0,
        initialStatus: 'Pendiente',
        notes: ''
      });
      setClients([]);
      
      alert('Pedido creado exitosamente');
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('Error al crear el pedido');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      await loadInitialData();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleDelete = async (orderId) => {
    if (!hasPermission('eliminar_pedido')) {
      alert('No tienes permisos para eliminar pedidos');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      try {
        await orderService.delete(orderId);
        await loadInitialData();
      } catch (error) {
        console.error('Error eliminando pedido:', error);
        alert('Error al eliminar el pedido');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'Todos') return true;
    return order.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Pendiente': { class: 'pending', text: 'Pendiente' },
      'En Camino': { class: 'in-transit', text: 'En Camino' },
      'Entregado': { class: 'delivered', text: 'Entregado' }
    };
    const badge = badges[status] || { class: '', text: status };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getTransactionBadge = (type, discount) => {
    if (type === 'Donación') {
      return <span className="transaction-badge donation">🎁 Donación</span>;
    } else if (discount && discount > 0) {
      return <span className="transaction-badge discount">% Descuento Q{discount}</span>;
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  return (
    <div className="pedidos-page">
      <div className="pedidos-layout">
        <div className="pedidos-form-section">
          <h2 className="section-title">Nuevo Pedido</h2>
          
          <form onSubmit={handleSubmit} className="pedido-form">
            <div className="form-group">
              <label>Comunidad *</label>
              <select
                value={formData.communityId}
                onChange={handleCommunityChange}
                required
              >
                <option value="">Selecciona una comunidad</option>
                {communities.map(community => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cliente *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
                disabled={!formData.communityId}
              >
                <option value="">Primero selecciona una comunidad</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Transacción *</label>
              <select
                value={formData.transactionType}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  transactionType: e.target.value,
                  discount: e.target.value === 'Descuento' ? formData.discount : 0
                })}
                required
              >
                <option value="Venta">Venta</option>
                <option value="Donación">Donación</option>
                <option value="Descuento">Descuento</option>
              </select>
            </div>

            {formData.transactionType === 'Descuento' && (
              <div className="form-group">
                <label>Porcentaje de Descuento</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Cantidad de Garrafones *</label>
              <input
                type="number"
                min="1"
                value={formData.bottles}
                onChange={(e) => setFormData({ ...formData, bottles: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label>Estado Inicial</label>
              <select
                value={formData.initialStatus}
                onChange={(e) => setFormData({ ...formData, initialStatus: e.target.value })}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Camino">En Camino</option>
                <option value="Entregado">Entregado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notas Adicionales</label>
              <textarea
                placeholder="Ej: Dejar en la entrada, tocar el timbre..."
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              <Plus size={20} />
              Crear Pedido
            </button>
          </form>
        </div>

        <div className="pedidos-list-section">
          <div className="list-header">
            <div>
              <h2 className="section-title">Lista de Pedidos</h2>
              <p className="orders-count">{filteredOrders.length} pedidos</p>
            </div>
          </div>

          <div className="filter-tabs">
            <button 
              className={filter === 'Todos' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('Todos')}
            >
              Todos ({orders.length})
            </button>
            <button 
              className={filter === 'Pendiente' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('Pendiente')}
            >
              Pendientes ({orders.filter(o => o.status === 'Pendiente').length})
            </button>
            <button 
              className={filter === 'En Camino' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('En Camino')}
            >
              En Camino ({orders.filter(o => o.status === 'En Camino').length})
            </button>
            <button 
              className={filter === 'Entregado' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilter('Entregado')}
            >
              Entregados ({orders.filter(o => o.status === 'Entregado').length})
            </button>
          </div>

          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-item-header">
                  <div>
                    <h3 className="order-client-name">{order.clientName}</h3>
                    <span className="order-community-tag">{order.communityName}</span>
                  </div>
                  <div className="order-badges">
                    {getStatusBadge(order.status)}
                    {getTransactionBadge(order.transactionType, order.discount)}
                  </div>
                </div>

                <div className="order-item-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{order.address}</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={16} />
                    <span>{order.phone}</span>
                  </div>
                  <div className="detail-item">
                    <Droplets size={16} />
                    <span>{order.bottles} garrafones</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{new Date(order.date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                <div className="order-item-actions">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Camino">En Camino</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                  
                  {hasPermission('eliminar_pedido') && (
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="delete-button"
                      title="Eliminar pedido"
                    >
                      <Trash2 size={18} />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="empty-state">
                <p>No hay pedidos con este filtro</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pedidos;
