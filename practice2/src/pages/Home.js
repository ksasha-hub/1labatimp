import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllThreats, deleteThreat } from '../api/threatsApi';

const getBadgeClass = (severity) => {
  const map = {
    'Критическая': 'badge badge-critical',
    'Высокая':     'badge badge-high',
    'Средняя':     'badge badge-medium',
    'Низкая':      'badge badge-low',
  };
  return map[severity] || 'badge badge-low';
};

const Home = () => {
  const [threats, setThreats] = useState([]);   
  const [loading, setLoading] = useState(true); 
  const [error,   setError]   = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    getAllThreats()
      .then(response => {
        setThreats(Array.isArray(response.data) ? response.data : response.data.items ?? []);
        setLoading(false);
      })
      .catch(err => {
        const status = err.response?.status;
        if      (status >= 500)  setError('Ошибка сервера (5xx). Проверьте, запущен ли json-server.');
        else if (status === 404) setError('Ресурс не найден (404).');
        else                     setError(`Ошибка загрузки данных: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Удалить угрозу "${name}"?`)) return;
    deleteThreat(id)
      .then(() => {
        setThreats(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => setError(`Ошибка удаления: ${err.message}`));
  };

  if (loading) return <div className="spinner"> Загрузка данных...</div>;

  return (
    <div>
      <h1 className="page-title"> Угрозы информационной безопасности</h1>

      {}
      {error && <div className="error-box"> {error}</div>}

      {}
      {threats.length === 0 && !error ? (
        <div className="empty-state">
          <div className="icon"></div>
          <p>Угроз не добавлено. Начните с первой!</p>
          <Link to="/add" className="btn btn-save">+ Добавить угрозу</Link>
        </div>
      ) : (
        <div className="cards-grid">
          {threats.map(threat => (
            <div className="card" key={threat.id}>
              {}
              <span className={getBadgeClass(threat.severity)}>{threat.severity}</span>

              {}
              <Link to={`/detail/${threat.id}`} className="card-title">
                {threat.name}
              </Link>

              {}
              <div className="card-meta">
                📁 {threat.category} &nbsp;|&nbsp; {threat.year}
              </div>

              {}
              <p className="card-desc">{threat.description}</p>

              {}
              <div className="card-actions">
                <button className="btn btn-edit"
                  onClick={() => navigate(`/edit/${threat.id}`)}>
                  Изменить
                </button>
                <button className="btn btn-delete"
                  onClick={() => handleDelete(threat.id, threat.name)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
