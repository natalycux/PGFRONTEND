import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/api';
import {
  Package, Clock, Truck, CheckCircle,
  DollarSign, Gift, Percent, Droplets,
  Calendar, MapPin, Phone, CalendarDays
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [statistics, setStatistics]         = useState(null);
  const [ordersByCommunity, setOrdersByCommunity] = useState([]);
  const [ordersByDelivery, setOrdersByDelivery]   = useState([]);
  const [recentOrders, setRecentOrders]     = useState([]);
  const [loading, setLoading]               = useState(true);

  const [filtroActivo, setFiltroActivo]     = useState('hoy');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaDesde, setFechaDesde]         = useState('');
  const [fechaHasta, setFechaHasta]         = useState('');
  const [periodoTexto, setPeriodoTexto]     = useState('');
  const [totalGeneral, setTotalGeneral]     = useState(0);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDateEs = (dateStr) => {
    if (!dateStr) return '';
    const months = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)} de ${months[parseInt(m)-1]} de ${y}`;
  };

  const calcularFechas = (tipo) => {
    const hoy = new Date();
    switch (tipo) {
      case 'hoy': {
        const d = formatDate(hoy);
        return { desde: d, hasta: d, texto: formatDateEs(d) };
      }
      case 'ayer': {
        const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
        const d = formatDate(ayer);
        return { desde: d, hasta: d, texto: formatDateEs(d) };
      }
      case 'ultimos7': {
        const desde = new Date(hoy); desde.setDate(hoy.getDate() - 6);
        const d1 = formatDate(desde), d2 = formatDate(hoy);
        return { desde: d1, hasta: d2, texto: `${formatDateEs(d1)} – ${formatDateEs(d2)}` };
      }
      case 'ultimos30': {
        const desde = new Date(hoy); desde.setDate(hoy.getDate() - 29);
        const d1 = formatDate(desde), d2 = formatDate(hoy);
        return { desde: d1, hasta: d2, texto: `${formatDateEs(d1)} – ${formatDateEs(d2)}` };
      }
      case 'estaSemana': {
        const dom = new Date(hoy); dom.setDate(hoy.getDate() - hoy.getDay());
        const sab = new Date(dom); sab.setDate(dom.getDate() + 6);
        const d1 = formatDate(dom), d2 = formatDate(sab);
        return { desde: d1, hasta: d2, texto: `${formatDateEs(d1)} – ${formatDateEs(d2)}` };
      }
      case 'esteMes': {
        const primer = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        const d1 = formatDate(primer), d2 = formatDate(ultimo);
        return { desde: d1, hasta: d2, texto: `${formatDateEs(d1)} – ${formatDateEs(d2)}` };
      }
      case 'todoTiempo':
        return { desde: null, hasta: null, texto: 'Todo el tiempo' };
      default:
        return { desde: null, hasta: null, texto: '' };
    }
  };

  const parsearDatos = (data) => {
    const stats = data.estadisticasGenerales || data;
    const tiposMap = {};
    if (data.pedidosPorTipo) {
      data.pedidosPorTipo.forEach(t => {
        tiposMap[(t.tipo || '').toLowerCase()] = t.cantidad ?? t.total ?? 0;
      });
    }
    setStatistics({
      totalOrders:     stats.totalPedidos ?? 0,
      pendingOrders:   stats.totalPendientes ?? 0,
      inTransitOrders: stats.totalEnCamino ?? 0,
      deliveredOrders: stats.totalEntregados ?? 0,
      cancelledOrders: stats.totalCancelados ?? 0,
      ingresoTotal:    stats.ingresoTotal ?? 0,
      donations:  tiposMap['donacion'] ?? tiposMap['donación'] ?? 0,
      discounts:  tiposMap['descuento'] ?? 0,
      sales:      tiposMap['venta'] ?? 0,
      totalBottles: stats.totalGarrafones ?? stats.garrafonesTotales ?? 0,
      todayOrders:  stats.pedidosHoy ?? 0,
      promedioDiario: stats.promedioDiario ?? 0,
    });
    setTotalGeneral(stats.totalPedidos ?? 0);
    setOrdersByCommunity(data.pedidosPorComunidad ?? []);
    setOrdersByDelivery(data.rankingRepartidores ?? []);
    setRecentOrders(data.pedidosRecientes ?? []);
  };

  const cargarDashboard = useCallback(async (tipo, desdeParam, hastaParam) => {
    setLoading(true);
    try {
      let desde = desdeParam, hasta = hastaParam, texto = '';
      if (!desdeParam && tipo !== 'personalizado') {
        const calc = calcularFechas(tipo);
        desde = calc.desde; hasta = calc.hasta; texto = calc.texto;
      } else if (tipo === 'personalizado') {
        texto = desdeParam === hastaParam
          ? formatDateEs(desdeParam)
          : `${formatDateEs(desdeParam)} – ${formatDateEs(hastaParam)}`;
      }
      setPeriodoTexto(texto);
      const data = await dashboardService.getStatistics(desde, hasta);
      parsearDatos(data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDashboard('hoy'); }, [cargarDashboard]);

  const handleFiltro = (tipo) => {
    setFiltroActivo(tipo);
    if (tipo === 'seleccionar') {
      setMostrarCalendario(true);
    } else {
      setMostrarCalendario(false);
      setFechaDesde(''); setFechaHasta('');
      cargarDashboard(tipo);
    }
  };

  const aplicarFechasPersonalizadas = () => {
    if (!fechaDesde || !fechaHasta) { alert('Selecciona ambas fechas'); return; }
    setMostrarCalendario(false);
    setFiltroActivo('personalizado');
    cargarDashboard('personalizado', fechaDesde, fechaHasta);
  };

  const limpiarFechas = () => {
    setFechaDesde(''); setFechaHasta('');
  };

  const getStatusBadge = (status) => {
    const map = {
      'Pendiente':  <span className="status-badge pending">Pendiente</span>,
      'En Camino':  <span className="status-badge in-transit">En Camino</span>,
      'Entregado':  <span className="status-badge delivered">Entregado</span>,
      'Cancelado':  <span className="status-badge cancelled">Cancelado</span>,
    };
    return map[status] || <span className="status-badge">{status}</span>;
  };

  const getTransactionBadge = (type, discount) => {
    if (type === 'Donacion' || type === 'Donación')
      return <span className="transaction-badge donation">🎁 Donación</span>;
    if (type === 'Descuento' || discount > 0)
      return <span className="transaction-badge discount">% {discount > 0 ? discount : ''}</span>;
    return null;
  };

  const maxCommunity = ordersByCommunity.length > 0
    ? Math.max(...ordersByCommunity.map(c => c.cantidad ?? c.cantidadGarrafones ?? 0)) : 1;
  const maxDelivery = ordersByDelivery.length > 0
    ? Math.max(...ordersByDelivery.map(d => d.totalPedidos ?? d.cantidadPedidos ?? 0)) : 1;

  const filtros = [
    { key: 'hoy',        label: 'Hoy' },
    { key: 'ayer',       label: 'Ayer' },
    { key: 'ultimos7',   label: 'Últimos 7 días' },
    { key: 'ultimos30',  label: 'Últimos 30 días' },
    { key: 'estaSemana', label: 'Esta Semana' },
    { key: 'esteMes',    label: 'Este Mes' },
    { key: 'todoTiempo', label: 'Todo el Tiempo' },
    { key: 'seleccionar', label: '📅 Seleccionar Fechas', icono: true },
  ];

  const filtroActivoKey = filtroActivo === 'personalizado' ? 'seleccionar' : filtroActivo;

  return (
    <div className="dashboard">

      {/* ── Selector de período ── */}
      <div className="periodo-card">
        <div className="periodo-header">
          <CalendarDays size={18} className="periodo-icon" />
          <span className="periodo-title">Período de Análisis</span>
        </div>

        <div className="filtros-rapidos">
          {filtros.map(f => (
            <button
              key={f.key}
              className={`filtro-btn${filtroActivoKey === f.key ? ' active' : ''}`}
              onClick={() => handleFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {mostrarCalendario && (
          <div className="calendario-row">
            <div className="fecha-grupo">
              <label>Fecha Inicio</label>
              <div className="fecha-input-wrap">
                <input type="date" value={fechaDesde}
                  onChange={e => setFechaDesde(e.target.value)} />
                <CalendarDays size={16} />
              </div>
            </div>
            <div className="fecha-grupo">
              <label>Fecha Fin</label>
              <div className="fecha-input-wrap">
                <input type="date" value={fechaHasta}
                  onChange={e => setFechaHasta(e.target.value)} />
                <CalendarDays size={16} />
              </div>
            </div>
            <button className="limpiar-btn" onClick={limpiarFechas}>✕ Limpiar</button>
            <button className="aplicar-btn" onClick={aplicarFechasPersonalizadas}>Aplicar</button>
          </div>
        )}

        <div className="periodo-footer">
          <span>Mostrando: <strong>{periodoTexto}</strong></span>
          <span className="periodo-total">{loading ? '…' : `${statistics?.totalOrders ?? 0} de ${totalGeneral} pedidos`}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        <>
          {/* Fila 1 */}
          <div className="stats-grid stats-row-4">
            <div className="stat-card">
              <div className="stat-icon blue"><Package size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Total Pedidos</p>
                <h2 className="stat-value">{statistics?.totalOrders ?? 0}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow"><Clock size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Pendientes</p>
                <h2 className="stat-value">{statistics?.pendingOrders ?? 0}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Truck size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">En Camino</p>
                <h2 className="stat-value">{statistics?.inTransitOrders ?? 0}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Entregados</p>
                <h2 className="stat-value">{statistics?.deliveredOrders ?? 0}</h2>
              </div>
            </div>
          </div>

          {/* Fila 2 */}
          <div className="stats-grid stats-row-3">
            <div className="stat-card">
              <div className="stat-icon indigo"><DollarSign size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Ingresos Totales</p>
                <h2 className="stat-value">Q{statistics?.ingresoTotal ?? 0}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><Gift size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Donaciones</p>
                <h2 className="stat-value">{statistics?.donations ?? 0}</h2>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon teal"><Percent size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Descuentos</p>
                <h2 className="stat-value">{statistics?.discounts ?? 0}</h2>
              </div>
            </div>
          </div>

          {/* Fila 3 */}
          <div className="stats-grid stats-row-2">
            <div className="stat-card">
              <div className="stat-icon cyan"><Droplets size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Garrafones Totales</p>
                <h2 className="stat-value">{statistics?.totalBottles ?? 0}</h2>
                <p className="stat-sublabel">En el período seleccionado</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pink"><Calendar size={22} /></div>
              <div className="stat-content">
                <p className="stat-label">Promedio Diario</p>
                <h2 className="stat-value">{statistics?.promedioDiario ?? 0}</h2>
                <p className="stat-sublabel">Pedidos por día</p>
              </div>
            </div>
          </div>

          {/* Garrafones por Comunidad */}
          {ordersByCommunity.length > 0 && (
            <div className="dashboard-section">
              <h3 className="section-title">Garrafones por Comunidad</h3>
              <div className="bar-list">
                {ordersByCommunity.map((c, i) => {
                  const val = c.cantidad ?? c.cantidadGarrafones ?? c.cantidadPedidos ?? 0;
                  const nombre = c.comunidad ?? c.nombreComunidad ?? '—';
                  return (
                    <div key={i} className="bar-item">
                      <span className="bar-name">{nombre}</span>
                      <div className="progress-bar">
                        <div className="progress-fill"
                          style={{ width: `${maxCommunity > 0 ? (val / maxCommunity) * 100 : 0}%` }} />
                      </div>
                      <span className="bar-count">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pedidos por Repartidor */}
          {ordersByDelivery.length > 0 && (
            <div className="dashboard-section">
              <h3 className="section-title">Pedidos por Repartidor</h3>
              <div className="bar-list">
                {ordersByDelivery.map((d, i) => {
                  const val = d.totalPedidos ?? d.cantidadPedidos ?? 0;
                  return (
                    <div key={i} className="bar-item">
                      <span className="bar-name">{d.nombreRepartidor}</span>
                      <div className="progress-bar">
                        <div className="progress-fill"
                          style={{ width: `${maxDelivery > 0 ? (val / maxDelivery) * 100 : 0}%` }} />
                      </div>
                      <span className="bar-count">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pedidos Recientes */}
          {recentOrders.length > 0 && (
            <div className="dashboard-section">
              <h3 className="section-title">Pedidos Recientes</h3>
              <div className="recent-orders">
                {recentOrders.map((order) => (
                  <div key={order.idPedido} className="order-card">
                    <div className="order-header">
                      <h4 className="order-client">{order.nombreCliente}</h4>
                      {order.nombreComunidad && (
                        <span className="order-community">{order.nombreComunidad}</span>
                      )}
                    </div>
                    <div className="order-details">
                      {getStatusBadge(order.estadoPedido)}
                      {getTransactionBadge(order.tipoTransaccion, order.montoDescuento)}
                    </div>
                    <div className="order-info">
                      <span><MapPin size={13} /> {order.direccionDetallada || 'Sin dirección'}</span>
                      <span><Phone size={13} /> {order.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div className="order-footer">
                      <span>💧 {order.cantidadGarrafones} garrafones</span>
                      <span>📅 {new Date(order.fechaCreacion).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
