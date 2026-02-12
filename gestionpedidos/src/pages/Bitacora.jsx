import { useState, useEffect } from 'react';
import { auditLogService } from '../services/api';
import { LogIn, Plus, Trash2, UserPlus, Clock } from 'lucide-react';
import './Bitacora.css';

const Bitacora = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, stats] = await Promise.all([
          auditLogService.getAll(),
          auditLogService.getStatistics()
        ]);
        setLogs(groupLogsByDate(logsData));
        setStatistics(stats);
      } catch (error) {
        console.error('Error cargando bitácora:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const groupLogsByDate = (logs) => {
    const grouped = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString('es-ES');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    return Object.entries(grouped).map(([date, logs]) => ({
      date,
      logs,
      count: logs.length
    }));
  };

  const getActionIcon = (action) => {
    const icons = {
      'Inicio de sesión': <LogIn size={20} color="#2563eb" />,
      'Creó pedido': <Plus size={20} color="#10b981" />,
      'Eliminó pedido': <Trash2 size={20} color="#dc2626" />,
      'Creó usuario': <UserPlus size={20} color="#8b5cf6" />
    };
    return icons[action] || <Clock size={20} color="#64748b" />;
  };

  const getActionBadge = (action) => {
    const badges = {
      'Inicio de sesión': 'login',
      'Creó pedido': 'create',
      'Eliminó pedido': 'delete',
      'Creó usuario': 'user-create'
    };
    return badges[action] || 'default';
  };

  if (loading) {
    return <div className="loading">Cargando bitácora...</div>;
  }

  return (
    <div className="bitacora-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bitácora de Actividades</h1>
          <p className="page-subtitle">Registro de todas las acciones realizadas en el sistema</p>
        </div>
      </div>

      {statistics && (
        <div className="stats-cards">
          <div className="stat-card-small">
            <p className="stat-label">Total de Registros</p>
            <h3 className="stat-number">{statistics.totalLogs}</h3>
          </div>
          <div className="stat-card-small">
            <p className="stat-label">Inicio de Sesión</p>
            <h3 className="stat-number">{statistics.loginCount}</h3>
          </div>
          <div className="stat-card-small">
            <p className="stat-label">Pedidos Creados</p>
            <h3 className="stat-number">{statistics.ordersCreated}</h3>
          </div>
          <div className="stat-card-small">
            <p className="stat-label">Usuarios Creados</p>
            <h3 className="stat-number">{statistics.usersCreated}</h3>
          </div>
        </div>
      )}

      <div className="logs-timeline">
        {logs.map((dateGroup, index) => (
          <div key={index} className="date-group">
            <div className="date-header">
              <Clock size={20} />
              <h3>{dateGroup.date}</h3>
              <span className="log-count">({dateGroup.count} registros)</span>
            </div>

            <div className="logs-list">
              {dateGroup.logs.map((log, logIndex) => (
                <div key={logIndex} className={`log-entry ${getActionBadge(log.action)}`}>
                  <div className="log-icon">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="log-content">
                    <div className="log-header-row">
                      <h4 className="log-user">{log.userName}</h4>
                      <span className="log-action-badge">{log.action}</span>
                    </div>
                    
                    <p className="log-details">{log.details}</p>
                    
                    <p className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="empty-state">
            <Clock size={48} color="#cbd5e1" />
            <p>No hay registros en la bitácora</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bitacora;
