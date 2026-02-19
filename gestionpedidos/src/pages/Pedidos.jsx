import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  orderService, 
  communityService, 
  clientService 
} from '../services/api';
import { Plus, MapPin, Phone, Calendar, Droplets, ChevronDown, XCircle, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import './Pedidos.css';

const Pedidos = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({ open: false, order: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  const openCreateModal = () => {
    setFormData({
      communityId: '',
      clientId: '',
      transactionType: 'Venta',
      bottles: '',
      unitPrice: '',
      discount: '',
      initialStatus: 'Pendiente',
      notes: ''
    });
    setClients([]);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => setShowCreateModal(false);

  // Form state
  const [formData, setFormData] = useState({
    communityId: '',
    clientId: '',
    transactionType: 'Venta',
    bottles: '',
    unitPrice: '',
    discount: '',
    initialStatus: 'Pendiente',
    notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      console.error('âŒ Error cargando datos:', error);
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
        console.error('âŒ Error cargando clientes:', error);
      }
    } else {
      setClients([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        idComunidad: parseInt(formData.communityId),
        idCliente: parseInt(formData.clientId),
        tipoTransaccion: formData.transactionType,
        cantidadGarrafones: parseInt(formData.bottles) || 1,
        precioUnitario: parseFloat(formData.unitPrice) || 0,
        montoDescuento: parseFloat(formData.discount) || 0,
        estadoInicial: formData.initialStatus,
        notasAdicionales: formData.notes || ''
      };
      console.log('Enviando pedido:', JSON.stringify(orderData));
      await orderService.create(orderData);
      await loadInitialData();
      setFormData({
        communityId: '',
        clientId: '',
        transactionType: 'Venta',
        bottles: '',
        unitPrice: '',
        discount: '',
        initialStatus: 'Pendiente',
        notes: ''
      });
      setClients([]);
      await Swal.fire({
        icon: 'success',
        title: '¡Pedido creado!',
        text: 'El pedido fue registrado exitosamente.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Aceptar'
      });
      closeCreateModal();
    } catch (error) {
      console.error('Error creando pedido status:', error.response?.status);
      console.error('Error respuesta completa:', JSON.stringify(error.response?.data));
      const msg = error.response?.data?.message
        || error.response?.data?.title
        || (typeof error.response?.data === 'string' ? error.response.data : null)
        || error.message;
      Swal.fire({
        icon: 'error',
        title: 'Error al crear el pedido',
        text: msg,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setOpenDropdownId(null);
    try {
      await orderService.updateStatus(orderId, newStatus);
    } catch (error) {
      console.warn('âš ï¸ Error en respuesta:', error.response?.status);
    } finally {
      await loadInitialData();
    }
  };

  const openCancelModal = (order) => {
    setCancelModal({ open: true, order });
    setCancelReason('');
    setCancelReasonError(false);
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, order: null });
    setCancelReason('');
    setCancelReasonError(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelReasonError(true);
      return;
    }
    setCancelLoading(true);
    try {
      await orderService.cancelOrder(
        cancelModal.order.idPedido,
        cancelReason.trim(),
        user?.id
      );
      await loadInitialData();
      closeCancelModal();
      Swal.fire({
        icon: 'success',
        title: 'Pedido cancelado',
        text: 'El pedido fue cancelado correctamente.',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cancelar',
        text: error.response?.data?.message || error.message,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Cerrar'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'Todos') return true;
    if (filter === 'Pendiente') return order.estadoPedido === 'Pendiente';
    if (filter === 'En Camino') return order.estadoPedido === 'En Camino';
    if (filter === 'Entregado') return order.estadoPedido === 'Entregado';
    if (filter === 'Cancelado') return order.estadoPedido === 'Cancelado';
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Pendiente':  { cls: 'badge-pending',   text: 'Pendiente'  },
      'En Camino':  { cls: 'badge-transit',   text: 'En Camino'  },
      'Entregado':  { cls: 'badge-delivered', text: 'Entregado'  },
      'Cancelado':  { cls: 'badge-cancelled', text: 'Cancelado'  },
    };
    const b = badges[status] || { cls: '', text: status };
    return <span className={`order-badge ${b.cls}`}>{b.text}</span>;
  };

  const getTransactionBadge = (type, discount) => {
    if (type === 'Donacion' || type === 'Donación') {
      return <span className="order-badge badge-donation">🎁 Donación</span>;
    } else if (type === 'Descuento') {
      return <span className="order-badge badge-discount">% Descuento {discount > 0 ? `Q${discount}` : ''}</span>;
    } else if (type === 'Venta') {
      return <span className="order-badge badge-sale">Venta</span>;
    }
    return null;
  };

  const getCancellationInfo = (order) => {
    const notes = order.notasAdicionales || '';
    const match = notes.match(/\[CANCELADO\]:\s*(.+?)(?:\s*\|.*)?$/);
    const reason = match ? match[1].trim() : notes;
    const cancelledBy = order.canceladoPor || order.nombreCancelador || null;
    const cancelledAt = order.fechaCancelacion || order.fechaActualizacion;
    const dateStr = cancelledAt
      ? new Date(cancelledAt).toLocaleString('es-ES')
      : '';
    return { reason, cancelledBy, dateStr };
  };

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  const countBy = (status) => orders.filter(o => o.estadoPedido === status).length;

  return (
    <div className="pedidos-page">

      {/* ── Lista de Pedidos ── */}
      <div className="pedidos-list-section">
        <div className="list-header">
          <div>
            <h2 className="section-title">Lista de Pedidos</h2>
            <p className="orders-count">{filteredOrders.length} pedidos</p>
          </div>
          <button className="create-order-btn" onClick={openCreateModal}>
            <Plus size={18} />
            Crear Pedido
          </button>
        </div>

        <div className="filter-tabs">
          {[
            { key: 'Todos',     label: 'Todos',      count: orders.length },
            { key: 'Pendiente', label: 'Pendientes', count: countBy('Pendiente') },
            { key: 'En Camino', label: 'En Camino',  count: countBy('En Camino') },
            { key: 'Entregado', label: 'Entregados', count: countBy('Entregado') },
            { key: 'Cancelado', label: 'Cancelados', count: countBy('Cancelado') },
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab${filter === tab.key ? ' active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="orders-list" ref={dropdownRef}>
          {filteredOrders.map(order => {
            const isCancelled = order.estadoPedido === 'Cancelado';
            const cancelInfo = isCancelled ? getCancellationInfo(order) : null;
            return (
              <div key={order.idPedido} className={`order-item${isCancelled ? ' order-item--cancelled' : ''}`}>
                <div className="order-item-header">
                  <div className="order-name-row">
                    <h3 className={`order-client-name${isCancelled ? ' cancelled-name' : ''}`}>{order.nombreCliente}</h3>
                    {isCancelled && <span className="cancelled-icon" title="Cancelado">🚫</span>}
                  </div>
                  <div className="order-badges">
                    {getStatusBadge(order.estadoPedido)}
                    {getTransactionBadge(order.tipoTransaccion, order.montoDescuento)}
                  </div>
                </div>
                <div className="order-item-details">
                  <div className="detail-item"><MapPin size={14} /><span>{order.direccionDetallada || 'Sin dirección'}</span></div>
                  <div className="detail-item"><Phone size={14} /><span>{order.telefono || 'Sin teléfono'}</span></div>
                  <div className="detail-row">
                    <div className="detail-item"><Droplets size={14} /><span>{order.cantidadGarrafones} garrafones</span></div>
                    <div className="detail-item"><Calendar size={14} /><span>{new Date(order.fechaCreacion).toLocaleDateString('es-MX')}</span></div>
                  </div>
                </div>
                {order.tipoTransaccion !== 'Donacion' && order.tipoTransaccion !== 'Donación' && (
                  <div className="order-price-summary">
                    {order.precioUnitario > 0 && (
                      <div className="price-row">
                        <span>{order.cantidadGarrafones} × Q{Number(order.precioUnitario).toFixed(2)}</span>
                        <span>Q{(order.cantidadGarrafones * order.precioUnitario).toFixed(2)}</span>
                      </div>
                    )}
                    {order.tipoTransaccion === 'Descuento' && order.montoDescuento > 0 && (
                      <div className="price-row price-row--discount">
                        <span>Descuento aplicado</span>
                        <span>- Q{Number(order.montoDescuento).toFixed(2)}</span>
                      </div>
                    )}
                    {(order.montoTotal > 0 || order.precioUnitario > 0) && (
                      <div className="price-row price-row--total">
                        <span>Total</span>
                        <span>Q{order.montoTotal != null
                          ? Number(order.montoTotal).toFixed(2)
                          : Math.max(0, (order.cantidadGarrafones * order.precioUnitario) - (order.tipoTransaccion === 'Descuento' ? (order.montoDescuento || 0) : 0)).toFixed(2)
                        }</span>
                      </div>
                    )}
                  </div>
                )}
                {isCancelled && cancelInfo && (
                  <div className="cancellation-info">
                    <div className="cancellation-info-header"><AlertCircle size={15} /><span className="cancellation-info-title">Motivo de cancelación:</span></div>
                    <p className="cancellation-reason">{cancelInfo.reason}</p>
                    {(cancelInfo.cancelledBy || cancelInfo.dateStr) && (
                      <p className="cancellation-by">
                        Cancelado por:{' '}
                        {cancelInfo.cancelledBy && <span>{cancelInfo.cancelledBy}</span>}
                        {cancelInfo.cancelledBy && cancelInfo.dateStr && ' el '}
                        {cancelInfo.dateStr}
                      </p>
                    )}
                  </div>
                )}
                {isCancelled && <p className="cancelled-note">Este pedido ha sido cancelado y no puede ser modificado</p>}
                {!isCancelled && (
                  <div className="order-item-actions">
                    <div className="status-dropdown-wrapper">
                      <button className="status-dropdown-btn" onClick={() => setOpenDropdownId(openDropdownId === order.idPedido ? null : order.idPedido)}>
                        Cambiar Estado <ChevronDown size={14} />
                      </button>
                      {openDropdownId === order.idPedido && (
                        <div className="status-dropdown-menu">
                          {['Pendiente', 'En Camino', 'Entregado'].map(s => (
                            <button key={s} className={`status-dropdown-option${order.estadoPedido === s ? ' active' : ''}`} onClick={() => handleStatusChange(order.idPedido, s)}>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="cancel-order-btn" onClick={() => openCancelModal(order)}>
                      <XCircle size={16} /> Cancelar Pedido
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filteredOrders.length === 0 && <div className="empty-state"><p>No hay pedidos con este filtro</p></div>}
        </div>
      </div>

      {/* ── Modal Crear Pedido ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCreateModal(); }}>
          <div className="modal-card modal-card--create">
            <div className="modal-create-header">
              <div className="modal-create-icon"><Plus size={24} /></div>
              <h3 className="modal-title">Crear Nuevo Pedido</h3>
            </div>
            <form onSubmit={handleSubmit} className="pedido-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Comunidad *</label>
                  <select value={formData.communityId} onChange={handleCommunityChange} required>
                    <option value="">Selecciona una comunidad</option>
                    {communities.map(c => <option key={c.idComunidad} value={c.idComunidad}>{c.nombreComunidad}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cliente *</label>
                  <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} required disabled={!formData.communityId}>
                    <option value="">Primero selecciona una comunidad</option>
                    {clients.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombreCompleto}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Transacción *</label>
                  <select value={formData.transactionType} onChange={(e) => setFormData({ ...formData, transactionType: e.target.value, discount: '' })} required>
                    <option value="Venta">Venta</option>
                    <option value="Donacion">Donación</option>
                    <option value="Descuento">Descuento</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado Inicial</label>
                  <select value={formData.initialStatus} onChange={(e) => setFormData({ ...formData, initialStatus: e.target.value })}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Camino">En Camino</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad de Garrafones *</label>
                  <input type="number" min="1" value={formData.bottles} onChange={(e) => setFormData({ ...formData, bottles: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Precio Unitario (Q)</label>
                  <div className="input-with-suffix">
                    <input type="number" min="0" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })} />
                    <span className="input-suffix">Q</span>
                  </div>
                </div>
                {formData.transactionType === 'Descuento' && (
                  <div className="form-group form-group--full">
                    <label>Monto de Descuento (Q)</label>
                    <div className="input-with-suffix">
                      <input type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
                      <span className="input-suffix">Q</span>
                    </div>
                  </div>
                )}
                {formData.transactionType !== 'Donacion' && (
                  <div className="order-total-box form-group--full">
                    <div className="order-total-row">
                      <span>{parseInt(formData.bottles) || 0} garrafón(es) × Q{(parseFloat(formData.unitPrice) || 0).toFixed(2)}</span>
                      <span>Q{((parseInt(formData.bottles) || 0) * (parseFloat(formData.unitPrice) || 0)).toFixed(2)}</span>
                    </div>
                    {formData.transactionType === 'Descuento' && parseFloat(formData.discount) > 0 && (
                      <div className="order-total-row order-total-discount">
                        <span>Descuento</span>
                        <span>- Q{(parseFloat(formData.discount) || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="order-total-row order-total-final">
                      <span>Total</span>
                      <span>Q{Math.max(0, ((parseInt(formData.bottles) || 0) * (parseFloat(formData.unitPrice) || 0)) - (formData.transactionType === 'Descuento' ? (parseFloat(formData.discount) || 0) : 0)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <div className="form-group form-group--full">
                  <label>Notas Adicionales</label>
                  <textarea placeholder="Ej: Dejar en la entrada, tocar el timbre..." rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-confirm-btn"><Plus size={16} /> Crear Pedido</button>
                <button type="button" className="modal-back-btn" onClick={closeCreateModal}><XCircle size={16} /> Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Cancelar Pedido ── */}
      {cancelModal.open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCancelModal(); }}>
          <div className="modal-card">
            <div className="modal-icon-wrap"><XCircle size={32} className="modal-x-icon" /></div>
            <h3 className="modal-title">Cancelar Pedido</h3>
            <p className="modal-description">
              ¿Estás seguro de cancelar el pedido de <strong>{cancelModal.order?.nombreCliente}</strong>? Esta acción no se puede deshacer.
            </p>
            <label className="modal-label">Motivo de cancelación <span className="required">*</span></label>
            <textarea
              className={`modal-textarea${cancelReasonError ? ' modal-textarea--error' : ''}`}
              placeholder="Explica por qué se cancela este pedido..."
              value={cancelReason}
              onChange={(e) => { setCancelReason(e.target.value); if (e.target.value.trim()) setCancelReasonError(false); }}
              rows={4}
            />
            {cancelReasonError && <p className="modal-error-text">El motivo de cancelación es obligatorio.</p>}
            <div className="modal-actions">
              <button className="modal-confirm-btn" onClick={handleConfirmCancel} disabled={cancelLoading}>
                {cancelLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
              <button className="modal-back-btn" onClick={closeCancelModal} disabled={cancelLoading}>Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
