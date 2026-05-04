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
    if (!searchTerm.trim() && !selectedCategory) return threats;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return threats.filter(threat => {
      const matchSearch = !searchTerm.trim() || [
        threat.name,
        threat.category,
        threat.description,
        threat.severity,
        threat.year?.toString()
      ].some(field => field?.toLowerCase().includes(searchLower));
      
      const matchCategory = !selectedCategory || threat.category === selectedCategory;
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
              placeholder="Поиск по названию, категории, описанию, году или уровню опасности..." 
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

          {}
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

      {threats.length === 0 && !error ? (
        <div className="empty-state">
          <div className="icon"></div>
          <p>Угроз не добавлено. Начните с первой!</p>
          <Link to="/add" className="btn btn-save">+ Добавить угрозу</Link>
        </div>
      ) : (
        <>
          {}
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#343a40', 
                  color: 'white',
                  position: 'sticky',
                  top: 0
                }}>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left' }}>Название угрозы</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left' }}>Категория</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left' }}>Уровень опасности</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left' }}>Год</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left' }}>Описание</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'center' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredThreats.map((threat, index) => (
                  <tr key={threat.id} style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa'}>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{threat.id}</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <Link to={`/detail/${threat.id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>
                        {threat.name}
                      </Link>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{threat.category || '—'}</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <span className={getBadgeClass(threat.severity)}>{threat.severity}</span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>{threat.year || '—'}</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', maxWidth: '300px' }}>
                      {threat.description?.length > 100 
                        ? `${threat.description.substring(0, 100)}...` 
                        : threat.description || '—'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button 
                        className="btn btn-edit"
                        onClick={() => navigate(`/edit/${threat.id}`)}
                        style={{ marginRight: '8px' }}
                      >
                        ✏️ Изменить
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDelete(threat.id, threat.name)}
                      >
                        🗑️ Удалить
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredThreats.length === 0 && threats.length > 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                      🔍 По вашему запросу ничего не найдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Link to="/add" className="btn btn-save" style={{ padding: '10px 20px' }}>
              + Добавить угрозу
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
