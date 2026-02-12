import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  DollarSign, 
  Gift, 
  Percent,
  Droplets,
  Calendar
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [ordersByCommunity, setOrdersByCommunity] = useState([]);
  const [ordersByDelivery, setOrdersByDelivery] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stats, communities, deliveries, recent] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getOrdersByCommunity(),
        dashboardService.getOrdersByDeliveryPerson(),
        dashboardService.getRecentOrders()
      ]);

      setStatistics(stats);
      setOrdersByCommunity(communities);
      setOrdersByDelivery(deliveries);
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pendiente': <span className="status-badge pending">Pendiente</span>,
      'En Camino': <span className="status-badge in-transit">En Camino</span>,
      'Entregado': <span className="status-badge delivered">Entregado</span>
    };
    return badges[status] || status;
  };

  const getTransactionBadge = (type, discount) => {
    if (type === 'Donación') {
      return <span className="transaction-badge donation">🎁 Donación</span>;
    } else if (discount > 0) {
      return <span className="transaction-badge discount">% Descuento {discount}%</span>;
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <Package size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Pedidos</p>
            <h2 className="stat-value">{statistics?.totalOrders || 0}</h2>
          </div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon">
            <Clock size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pendientes</p>
            <h2 className="stat-value">{statistics?.pendingOrders || 0}</h2>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Truck size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">En Camino</p>
            <h2 className="stat-value">{statistics?.inTransitOrders || 0}</h2>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Entregados</p>
            <h2 className="stat-value">{statistics?.deliveredOrders || 0}</h2>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ventas</p>
            <h2 className="stat-value">{statistics?.sales || 0}</h2>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <Gift size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Donaciones</p>
            <h2 className="stat-value">{statistics?.donations || 0}</h2>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">
            <Percent size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Descuentos</p>
            <h2 className="stat-value">{statistics?.discounts || 0}</h2>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Droplets size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Garrafones Totales</p>
            <h2 className="stat-value">{statistics?.totalBottles || 0}</h2>
            <p className="stat-sublabel">En todos los pedidos registrados</p>
          </div>
        </div>

        <div className="stat-card calendar">
          <div className="stat-icon">
            <Calendar size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pedidos Hoy</p>
            <h2 className="stat-value">{statistics?.todayOrders || 0}</h2>
            <p className="stat-sublabel">{getCurrentDate()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">Pedidos por Comunidad</h3>
        <div className="community-list">
          {ordersByCommunity.map((community, index) => (
            <div key={index} className="community-item">
              <span className="community-name">{community.name}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(community.orders / statistics?.totalOrders) * 100}%` }}
                ></div>
              </div>
              <span className="community-count">{community.orders}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">Pedidos por Repartidor</h3>
        <div className="delivery-list">
          {ordersByDelivery.map((delivery, index) => (
            <div key={index} className="delivery-item">
              <span className="delivery-name">{delivery.name}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(delivery.orders / statistics?.totalOrders) * 100}%` }}
                ></div>
              </div>
              <span className="delivery-count">{delivery.orders}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">Pedidos Recientes</h3>
        <div className="recent-orders">
          {recentOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h4 className="order-client">{order.clientName}</h4>
                <span className="order-community">{order.communityName}</span>
              </div>
              <div className="order-details">
                {getStatusBadge(order.status)}
                {getTransactionBadge(order.transactionType, order.discount)}
              </div>
              <div className="order-info">
                <span className="order-address">📍 {order.address}</span>
                <span className="order-phone">📞 {order.phone}</span>
              </div>
              <div className="order-footer">
                <span className="order-bottles">💧 {order.bottles} garrafones</span>
                <span className="order-date">📅 {new Date(order.date).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
