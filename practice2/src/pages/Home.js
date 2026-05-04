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

  // Состояния для фильтрации по каждому столбцу
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    category: '',
    severity: '',
    year: '',
    description: ''
  });

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

  // Функция обновления фильтра
  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  // Логика фильтрации по всем столбцам
  const filteredThreats = useMemo(() => {
    return threats.filter(threat => {
      return Object.keys(filters).every(column => {
        const filterValue = filters[column].toString().toLowerCase().trim();
        if (!filterValue) return true;
        
        let threatValue = '';
        switch(column) {
          case 'id':
            threatValue = threat.id?.toString() || '';
            break;
          case 'name':
            threatValue = threat.name || '';
            break;
          case 'category':
            threatValue = threat.category || '';
            break;
          case 'severity':
            threatValue = threat.severity || '';
            break;
          case 'year':
            threatValue = threat.year?.toString() || '';
            break;
          case 'description':
            threatValue = threat.description || '';
            break;
          default:
            threatValue = '';
        }
        
        return threatValue.toLowerCase().includes(filterValue);
      });
    });
  }, [threats, filters]);

  // Уникальные значения для выпадающих списков фильтров
  const uniqueValues = useMemo(() => {
    return {
      categories: [...new Set(threats.map(t => t.category).filter(Boolean))],
      severities: [...new Set(threats.map(t => t.severity).filter(Boolean))],
      years: [...new Set(threats.map(t => t.year).filter(Boolean))].sort((a,b) => b - a)
    };
  }, [threats]);

  // Сброс всех фильтров
  const clearAllFilters = () => {
    setFilters({
      id: '',
      name: '',
      category: '',
      severity: '',
      year: '',
      description: ''
    });
  };

  // Проверка активных фильтров
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  if (loading) return <div className="spinner"> Загрузка данных...</div>;

  return (
    <div>
      <h1 className="page-title"> Угрозы информационной безопасности</h1>

      {error && <div className="error-box"> {error}</div>}

      {threats.length === 0 && !error ? (
        <div className="empty-state">
          <div className="icon"></div>
          <p>Угроз не добавлено. Начните с первой!</p>
          <Link to="/add" className="btn btn-save">+ Добавить угрозу</Link>
        </div>
      ) : (
        <>
          {/* Статистика и кнопка сброса */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>📊 Найдено угроз: {filteredThreats.length}</strong> из {threats.length}
              {hasActiveFilters && (
                <span style={{ marginLeft: '15px', color: '#6c757d' }}>
                  🔍 Фильтры активны
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✖️ Сбросить все фильтры
              </button>
            )}
          </div>

          {/* Excel-подобная таблица с фильтрацией в каждом столбце */}
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                {/* Заголовки столбцов */}
                <tr style={{ 
                  backgroundColor: '#343a40', 
                  color: 'white'
                }}>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '80px' }}>ID</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '200px' }}>Название угрозы</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '150px' }}>Категория</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '130px' }}>Уровень опасности</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '80px' }}>Год</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '250px' }}>Описание</th>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'center', minWidth: '150px' }}>Действия</th>
                 </tr>
                
                {/* Строка фильтров */}
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  {/* Фильтр ID */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    <input
                      type="text"
                      placeholder="Фильтр ID..."
                      value={filters.id}
                      onChange={(e) => handleFilterChange('id', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #ced4da', fontSize: '12px' }}
                    />
                  </th>
                  
                  {/* Фильтр Названия */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    <input
                      type="text"
                      placeholder="Фильтр названия..."
                      value={filters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #ced4da', fontSize: '12px' }}
                    />
                  </th>
                  
                  {/* Фильтр Категории (выпадающий список) */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #ced4da', fontSize: '12px' }}
                    >
                      <option value="">Все категории</option>
                      {uniqueValues.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </th>
                  
                  {/* Фильтр Уровня опасности (выпадающий список) */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    <select
                      value={filters.severity}
                      onChange={(e) => handleFilterChange('severity', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #ced4da', fontSize: '12px' }}
                    >
                      <option value="">Все уровни</option>
                      {uniqueValues.severities.map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </th>
                  
                  {/* Фильтр Года (выпадающий список) */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #ced4da', fontSize: '12px' }}
                    >
                      <option value="">Все годы</option>
                      {uniqueValues.years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </th>
                  
                  {/* Фильтр Описания */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                    <input
                      type="text"
                      placeholder="Фильтр описания..."
                      value={filters.description}
                      onChange={(e) => handleFilterChange('description', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '3px', border: '1px solid #ced4da', fontSize: '12px' }}
                    />
                  </th>
                  
                  {/* Действия - кнопка сброса фильтров этого столбца */}
                  <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setFilters({
                          id: '',
                          name: '',
                          category: '',
                          severity: '',
                          year: '',
                          description: ''
                        });
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      title="Сбросить все фильтры"
                    >
                      ✖️ Сбросить
                    </button>
                  </th>
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
                    
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                      <code style={{ fontSize: '12px' }}>{threat.id}</code>
                    </td>
                    
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <Link to={`/detail/${threat.id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>
                        {threat.name}
                      </Link>
                    </td>
                    
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      {threat.category || '—'}
                    </td>
                    
                    <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                      <span className={getBadgeClass(threat.severity)}>{threat.severity}</span>
                    </td>
                    
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                      {threat.year || '—'}
                    </td>
                    
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
          
          {/* Кнопка добавления */}
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
