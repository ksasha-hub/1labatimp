import React, { useState, useEffect, useMemo } from 'react';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const filteredThreats = useMemo(() => {
    return threats.filter(threat => {
      const matchSearch = threat.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === '' || threat.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [threats, searchTerm, selectedCategory]);

  const severitySummary = useMemo(() => {
    const summary = { 'Критическая': 0, 'Высокая': 0, 'Средняя': 0, 'Низкая': 0 };
    filteredThreats.forEach(threat => {
      if (summary[threat.severity] !== undefined) {
        summary[threat.severity] += 1;
      }
    });
    return summary;
  }, [filteredThreats]);

  const uniqueCategories = useMemo(() => {
    const cats = threats.map(t => t.category).filter(Boolean);
    return [...new Set(cats)];
  }, [threats]);

  if (loading) return <div className="spinner"> Загрузка данных...</div>;

  return (
    <div>
      <h1 className="page-title"> Угрозы информационной безопасности</h1>

      {error && <div className="error-box"> {error}</div>}

      {}
      {!error && threats.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Поиск по названию..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Все категории</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Всего отображено</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Критических</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Высоких</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Средних</th>
                <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Низких</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>{filteredThreats.length}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', color: '#dc3545', fontWeight: 'bold' }}>{severitySummary['Критическая']}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', color: '#fd7e14', fontWeight: 'bold' }}>{severitySummary['Высокая']}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', color: '#ffc107', fontWeight: 'bold' }}>{severitySummary['Средняя']}</td>
                <td style={{ padding: '8px', border: '1px solid #dee2e6', color: '#28a745', fontWeight: 'bold' }}>{severitySummary['Низкая']}</td>
              </tr>
            </tbody>
          </table>

        </div>
      )}
      {}

      {threats.length === 0 && !error ? (
        <div className="empty-state">
          <div className="icon"></div>
          <p>Угроз не добавлено. Начните с первой!</p>
          <Link to="/add" className="btn btn-save">+ Добавить угрозу</Link>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredThreats.map(threat => (
            <div className="card" key={threat.id}>              
              <span className={getBadgeClass(threat.severity)}>{threat.severity}</span>
              <Link to={`/detail/${threat.id}`} className="card-title">
                {threat.name}
              </Link>
              <div className="card-meta">
                📁 {threat.category} &nbsp;|&nbsp; {threat.year}
              </div>
              <p className="card-desc">{threat.description}</p>
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
          
          {filteredThreats.length === 0 && threats.length > 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6c757d' }}>По вашему запросу ничего не найдено.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
