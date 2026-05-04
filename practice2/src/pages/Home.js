import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// Компонент выпадающего фильтра для каждого столбца
const ColumnFilter = ({ column, onFilter, currentFilter, uniqueValues = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(currentFilter);
  const dropdownRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    onFilter(tempValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempValue('');
    onFilter('');
    setIsOpen(false);
  };

  const getFilterInput = () => {
    if (column === 'category' || column === 'severity' || column === 'year') {
      return (
        <select
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '14px'
          }}
        >
          <option value="">Все</option>
          {uniqueValues.map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        type="text"
        placeholder={`Фильтр по ${column}...`}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          fontSize: '14px'
        }}
        autoFocus
      />
    );
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <span 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', 
          marginLeft: '8px',
          fontSize: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: currentFilter ? '#007bff' : '#6c757d',
          color: 'white',
          transition: 'all 0.2s'
        }}
        title="Фильтр"
      >
        {currentFilter ? '🔽' : '▼'}
      </span>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '5px',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '12px',
          minWidth: '250px',
          zIndex: 1000,
          backgroundColor: 'white'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px', color: '#495057' }}>
              Фильтр: {column === 'name' ? 'Название' : 
                        column === 'category' ? 'Категория' : 
                        column === 'severity' ? 'Уровень опасности' : 
                        column === 'year' ? 'Год' :
                        column === 'description' ? 'Описание' : column}
            </div>
            {getFilterInput()}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleClear}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Очистить
            </button>
            <button
              onClick={handleApply}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
                <span style={{ marginLeft: '15px', color: '#007bff' }}>
                  🔍 Фильтры активны ({Object.values(filters).filter(v => v !== '').length})
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
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

          {/* Excel-подобная таблица со скрытыми фильтрами */}
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
                  color: 'white'
                }}>
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '100px' }}>
                    ID
                    <ColumnFilter 
                      column="id"
                      onFilter={(value) => handleFilterChange('id', value)}
                      currentFilter={filters.id}
                    />
                  </th>
                  
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '200px' }}>
                    Название угрозы
                    <ColumnFilter 
                      column="name"
                      onFilter={(value) => handleFilterChange('name', value)}
                      currentFilter={filters.name}
                    />
                  </th>
                  
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '150px' }}>
                    Категория
                    <ColumnFilter 
                      column="category"
                      onFilter={(value) => handleFilterChange('category', value)}
                      currentFilter={filters.category}
                      uniqueValues={uniqueValues.categories}
                    />
                  </th>
                  
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '150px' }}>
                    Уровень опасности
                    <ColumnFilter 
                      column="severity"
                      onFilter={(value) => handleFilterChange('severity', value)}
                      currentFilter={filters.severity}
                      uniqueValues={uniqueValues.severities}
                    />
                  </th>
                  
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '100px' }}>
                    Год
                    <ColumnFilter 
                      column="year"
                      onFilter={(value) => handleFilterChange('year', value)}
                      currentFilter={filters.year}
                      uniqueValues={uniqueValues.years}
                    />
                  </th>
                  
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'left', minWidth: '300px' }}>
                    Описание
                    <ColumnFilter 
                      column="description"
                      onFilter={(value) => handleFilterChange('description', value)}
                      currentFilter={filters.description}
                    />
                  </th>
                  
                  <th style={{ padding: '12px', border: '1px solid #454d55', textAlign: 'center', minWidth: '150px' }}>
                    Действия
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
