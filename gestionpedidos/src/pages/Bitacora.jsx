import { useState, useEffect, useRef } from 'react';
import { auditLogService } from '../services/api';
import { LogIn, Plus, Trash2, UserPlus, Clock, Calendar, X } from 'lucide-react';
import './Bitacora.css';

// ── Calendario popup ─────────────────────────────────────────────────────────
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const CalendarPicker = ({ selectedDate, onChange, onClose }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();

  const handleDay = (day) => {
    onChange(new Date(viewYear, viewMonth, day));
    onClose();
  };

  const handleToday = () => {
    onChange(new Date());
    onClose();
  };

  const handleClear = () => {
    onChange(null);
    onClose();
  };

  const isSame = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear &&
           selectedDate.getMonth() === viewMonth &&
           selectedDate.getDate() === day;
  };

  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-popup">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{MESES[viewMonth]} {viewYear}</span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {DIAS_SEMANA.map(d => <span key={d} className="cal-day-name">{d}</span>)}
        {cells.map((day, i) => (
          <button
            key={i}
            className={`cal-day ${day ? '' : 'cal-empty'} ${isSame(day) ? 'cal-selected' : ''} ${isToday(day) && !isSame(day) ? 'cal-today' : ''}`}
            onClick={() => day && handleDay(day)}
            disabled={!day}
          >
            {day || ''}
          </button>
        ))}
      </div>
      <div className="cal-actions">
        <button className="cal-btn-today" onClick={handleToday}>Hoy</button>
        <button className="cal-btn-clear" onClick={handleClear}>Limpiar</button>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const Bitacora = () => {
  const [rawLogs, setRawLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate]     = useState(null);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal,   setShowEndCal]   = useState(false);
  const startRef = useRef(null);
  const endRef   = useRef(null);

  // Cerrar popups al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (startRef.current && !startRef.current.contains(e.target)) setShowStartCal(false);
      if (endRef.current   && !endRef.current.contains(e.target))   setShowEndCal(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logsData = await auditLogService.getAll();
        setRawLogs(logsData);
        setTotalLogs(logsData.length);
      } catch (error) {
        console.error('❌ Error cargando bitácora:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const filteredLogs = rawLogs.filter(log => {
    const d = new Date(log.fechaHora);
    const logDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (startDate) {
      const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (logDay < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      if (logDay > e) return false;
    }
    return true;
  });

  const isFiltered = startDate !== null || endDate !== null;

  // Verificar si el filtro activo es "solo hoy"
  const isTodayOnly = (() => {
    if (!startDate || !endDate) return false;
    const today = new Date();
    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    return sameDay(startDate, today) && sameDay(endDate, today);
  })();

  // ── Estadísticas del filtro ─────────────────────────────────────────────────
  const stats = {
    total:    filteredLogs.length,
    logins:   filteredLogs.filter(l => l.accion === 'LOGIN').length,
    pedidos:  filteredLogs.filter(l => ['CREAR_PEDIDO','ACTUALIZACION_PEDIDO','ACTUALIZAR_ESTADO','ELIMINAR_PEDIDO'].includes(l.accion)).length,
    usuarios: filteredLogs.filter(l => ['CREAR_USUARIO','DESACTIVAR_USUARIO','CAMBIO_PASSWORD'].includes(l.accion)).length,
  };

  // ── Agrupado por fecha ──────────────────────────────────────────────────────
  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.fechaHora).toLocaleDateString('es-ES');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(log);
    });
    return Object.entries(grouped).map(([date, logs]) => ({ date, logs, count: logs.length }));
  };

  const groupedLogs = groupLogsByDate(filteredLogs);

  // ── Acciones de filtro ──────────────────────────────────────────────────────
  const handleToday = () => {
    const t = new Date();
    setStartDate(t);
    setEndDate(t);
  };

  const handleVerTodo = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const formatDate = (d) => d ? d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' }) : '';

  // ── Iconos y badges ─────────────────────────────────────────────────────────
  const getActionIcon = (action) => {
    const icons = {
      'LOGIN':               <LogIn   size={20} color="#2563eb" />,
      'CREAR_PEDIDO':        <Plus    size={20} color="#10b981" />,
      'ACTUALIZAR_ESTADO':   <Clock   size={20} color="#f59e0b" />,
      'ACTUALIZACION_PEDIDO':<Clock   size={20} color="#f59e0b" />,
      'ELIMINAR_PEDIDO':     <Trash2  size={20} color="#dc2626" />,
      'CREAR_USUARIO':       <UserPlus size={20} color="#8b5cf6" />,
      'CAMBIO_PASSWORD':     <Clock   size={20} color="#3b82f6" />,
      'DESACTIVAR_USUARIO':  <Trash2  size={20} color="#ef4444" />
    };
    return icons[action] || <Clock size={20} color="#64748b" />;
  };

  const getActionBadge = (action) => {
    const badges = {
      'LOGIN':               'login',
      'CREAR_PEDIDO':        'create',
      'ACTUALIZAR_ESTADO':   'update',
      'ACTUALIZACION_PEDIDO':'update',
      'ELIMINAR_PEDIDO':     'delete',
      'CREAR_USUARIO':       'user-create',
      'CAMBIO_PASSWORD':     'update',
      'DESACTIVAR_USUARIO':  'delete'
    };
    return badges[action] || 'default';
  };

  if (loading) return <div className="loading">Cargando bitácora...</div>;

  return (
    <div className="bitacora-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bitácora de Actividades</h1>
          <p className="page-subtitle">Registro de todas las acciones realizadas en el sistema</p>
        </div>
      </div>

      {/* ── Filtro por fecha ── */}
      <div className="filter-card">
        <div className="filter-card-title">
          <Calendar size={18} color="#2563eb" />
          <span>Filtrar por Fecha</span>
        </div>

        <div className="filter-row">
          {/* Fecha Inicio */}
          <div className="date-field" ref={startRef}>
            <label className="date-label">Fecha Inicio</label>
            <div className="date-input-wrap">
              <input
                className="date-input"
                readOnly
                value={formatDate(startDate)}
                placeholder="dd/mm/aaaa"
                onClick={() => { setShowStartCal(v => !v); setShowEndCal(false); }}
              />
              <button className="date-icon-btn" onClick={() => { setShowStartCal(v => !v); setShowEndCal(false); }}>
                <Calendar size={16} color="#94a3b8" />
              </button>
            </div>
            {showStartCal && (
              <CalendarPicker
                selectedDate={startDate}
                onChange={(d) => { setStartDate(d); if (d && endDate && d > endDate) setEndDate(d); }}
                onClose={() => setShowStartCal(false)}
              />
            )}
          </div>

          {/* Fecha Fin */}
          <div className="date-field" ref={endRef}>
            <label className="date-label">Fecha Fin</label>
            <div className="date-input-wrap">
              <input
                className="date-input"
                readOnly
                value={formatDate(endDate)}
                placeholder="dd/mm/aaaa"
                onClick={() => { setShowEndCal(v => !v); setShowStartCal(false); }}
              />
              <button className="date-icon-btn" onClick={() => { setShowEndCal(v => !v); setShowStartCal(false); }}>
                <Calendar size={16} color="#94a3b8" />
              </button>
            </div>
            {showEndCal && (
              <CalendarPicker
                selectedDate={endDate}
                onChange={(d) => { setEndDate(d); if (d && startDate && d < startDate) setStartDate(d); }}
                onClose={() => setShowEndCal(false)}
              />
            )}
          </div>

          {/* Botones */}
          <div className="filter-btns">
            <button className="btn-ver-todo" onClick={handleVerTodo}>
              <X size={14} /> Ver Todo
            </button>
            <button className="btn-hoy" onClick={handleToday}>
              <Clock size={14} /> Hoy
            </button>
          </div>
        </div>

        <p className="filter-info">
          Mostrando <strong>{filteredLogs.length}</strong> de <strong>{totalLogs}</strong> registros
          {isTodayOnly && <span className="filter-tag"> (Solo hoy)</span>}
          {isFiltered && !isTodayOnly && <span className="filter-tag"> (Filtrado)</span>}
        </p>
      </div>

      {/* ── Estadísticas ── */}
      <div className="stats-cards">
        <div className="stat-card-small">
          <p className="stat-label">Total de Registros</p>
          <h3 className="stat-number">{stats.total}</h3>
        </div>
        <div className="stat-card-small">
          <p className="stat-label">Inicio de Sesión</p>
          <h3 className="stat-number" style={{ color: '#2563eb' }}>{stats.logins}</h3>
        </div>
        <div className="stat-card-small">
          <p className="stat-label">Pedidos Creados</p>
          <h3 className="stat-number" style={{ color: '#10b981' }}>{stats.pedidos}</h3>
        </div>
        <div className="stat-card-small">
          <p className="stat-label">Usuarios Creados</p>
          <h3 className="stat-number" style={{ color: '#8b5cf6' }}>{stats.usuarios}</h3>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="logs-timeline">
        {groupedLogs.map((dateGroup, index) => (
          <div key={index} className="date-group">
            <div className="date-header">
              <Clock size={20} />
              <h3>{dateGroup.date}</h3>
              <span className="log-count">({dateGroup.count} registros)</span>
            </div>

            <div className="logs-list">
              {dateGroup.logs.map((log, logIndex) => (
                <div key={logIndex} className={`log-entry ${getActionBadge(log.accion)}`}>
                  <div className="log-icon">
                    {getActionIcon(log.accion)}
                  </div>
                  <div className="log-content">
                    <div className="log-header-row">
                      <h4 className="log-user">{log.nombreUsuario || 'Sistema'}</h4>
                      <span className="log-action-badge">{log.accion}</span>
                    </div>
                    <p className="log-details">{log.descripcion}</p>
                    <p className="log-time">
                      {new Date(log.fechaHora).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedLogs.length === 0 && (
          <div className="empty-state">
            <Clock size={48} color="#cbd5e1" />
            <p>No hay registros para el rango de fechas seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bitacora;
