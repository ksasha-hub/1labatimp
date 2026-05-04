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

// Порядок уровней угроз для отображения в сводной таблице
const SEVERITIES = ['Критическая', 'Высокая', 'Средняя', 'Низкая'];

const Home = () => {
  const [threats, setThreats] = useState([]);   
  const [loading, setLoading] = useState(true); 
  const [error,   setError]   = useState(null); 
  const navigate = useNavigate();

  // --- ФИЛЬТРАЦИЯ: состояния для фильтров ---
  // searchText — текстовый поиск по названию угрозы
  const [searchText,      setSearchText]      = useState('');
  // filterCategory — выбранная категория (пустая строка = все категории)
  const [filterCategory,  setFilterCategory]  = useState('');
  // filterSeverity — выбранный уровень угрозы (пустая строка = все уровни)
  const [filterSeverity,  setFilterSeverity]  = useState('');

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

  // --- ФИЛЬТРАЦИЯ: применяем фильтры к исходному массиву ---
  // filteredThreats — массив угроз, прошедших все активные фильтры
  const filteredThreats = threats.filter(t => {
    const matchesSearch   = t.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === '' || t.category === filterCategory;
    const matchesSeverity = filterSeverity === '' || t.severity === filterSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  // --- СВОДНАЯ ТАБЛИЦА: вычисляем агрегированные данные по отфильтрованным угрозам ---
  // Количество угроз по каждому уровню (из отфильтрованных)
  const countBySeverity = SEVERITIES.reduce((acc, sev) => {
    acc[sev] = filteredThreats.filter(t => t.severity === sev).length;
    return acc;
  }, {});

  // Получаем уникальные категории из всего списка для дропдауна фильтрации
  const allCategories = [...new Set(threats.map(t => t.category).filter(Boolean))].sort();

  if (loading) return <div className="spinner"> Загрузка данных...</div>;

  return (
    <div>
      <h1 className="page-title"> Угрозы информационной безопасности</h1>

      {error && <div className="error-box"> {error}</div>}

      {/* ===== БЛОК ФИЛЬТРАЦИИ =====
          Элементы управления для фильтрации данных:
          - текстовый поиск по названию угрозы
          - выпадающий список для выбора категории
          - выпадающий список для выбора уровня угрозы
          При изменении любого поля React автоматически пересчитывает
          filteredThreats и сводную таблицу. */}
      <div className="filter-bar">
        {/* Поле текстового поиска по названию */}
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Поиск по названию..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />

        {/* Выпадающий список категорий */}
        <select
          className="filter-select"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Выпадающий список уровней угрозы */}
        <select
          className="filter-select"
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
        >
          <option value="">Все уровни угрозы</option>
          {SEVERITIES.map(sev => (
            <option key={sev} value={sev}>{sev}</option>
          ))}
        </select>

        {/* Кнопка сброса всех фильтров */}
        {(searchText || filterCategory || filterSeverity) && (
          <button
            className="btn btn-back filter-reset"
            onClick={() => { setSearchText(''); setFilterCategory(''); setFilterSeverity(''); }}
          >
            ✕ Сбросить фильтры
          </button>
        )}
      </div>

      {/* ===== СВОДНАЯ ТАБЛИЦА =====
          Отображает агрегированную информацию по ОТФИЛЬТРОВАННЫМ данным.
          Обновляется автоматически при изменении фильтров, т.к. зависит
          от filteredThreats и countBySeverity, которые пересчитываются
          каждый рендер. */}
      <div className="summary-card">
        <h2 className="summary-title">📊 Сводная таблица</h2>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Показатель</th>
              <th>Значение</th>
            </tr>
          </thead>
          <tbody>
            {/* Общее количество угроз после фильтрации */}
            <tr>
              <td>Всего угроз (по фильтру)</td>
              <td><strong>{filteredThreats.length}</strong> из {threats.length}</td>
            </tr>
            {/* Количество угроз каждого уровня */}
            {SEVERITIES.map(sev => (
              <tr key={sev}>
                <td>
                  <span className={getBadgeClass(sev)}>{sev}</span>
                </td>
                <td>{countBySeverity[sev]}</td>
              </tr>
            ))}
            {/* Диапазон годов актуальности отфильтрованных угроз */}
            {filteredThreats.length > 0 && (
              <tr>
                <td>Годы актуальности</td>
                <td>
                  {Math.min(...filteredThreats.map(t => t.year))}
                  {' — '}
                  {Math.max(...filteredThreats.map(t => t.year))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Основной список угроз (отфильтрованный) */}
      {filteredThreats.length === 0 && !error ? (
        threats.length === 0 ? (
          <div className="empty-state">
            <div className="icon"></div>
            <p>Угроз не добавлено. Начните с первой!</p>
            <Link to="/add" className="btn btn-save">+ Добавить угрозу</Link>
          </div>
        ) : (
          // Когда данные есть, но фильтр не дал результатов
          <div className="empty-state">
            <div className="icon">🔎</div>
            <p>По выбранным фильтрам угрозы не найдены.</p>
          </div>
        )
      ) : (
        <div className="cards-grid">
          {filteredThreats.map(threat => (
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
