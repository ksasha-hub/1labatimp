import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getThreatById } from '../api/threatsApi';

const getBadgeClass = (severity) => {
  const map = {
    'Критическая': 'badge badge-critical',
    'Высокая':     'badge badge-high',
    'Средняя':     'badge badge-medium',
    'Низкая':      'badge badge-low',
  };
  return map[severity] || 'badge badge-low';
};

const Detail = () => {
  const { id } = useParams();      
  const navigate = useNavigate();

  const [threat,  setThreat]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getThreatById(id)
      .then(res => {
        setThreat(res.data);  
        setLoading(false);
      })
      .catch(err => {
        const status = err.response?.status;
        if      (status === 404) setError('Угроза не найдена (404).');
        else if (status >= 500)  setError('Ошибка сервера (5xx).');
        else                     setError(`Ошибка: ${err.message}`);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="spinner">⏳ Загрузка...</div>;
  if (error)   return (
    <div className="error-box">
       {error} &nbsp; <Link to="/">← На главную</Link>
    </div>
  );

  return (
    <div className="detail-card">
      <span className={getBadgeClass(threat.severity)}>{threat.severity}</span>
      <h1 className="detail-title">{threat.name}</h1>

      <table className="detail-table">
        <tbody>
          <tr><td> Категория</td>        <td>{threat.category}</td></tr>
          <tr><td> Уровень угрозы</td>   <td>{threat.severity}</td></tr>
          <tr><td> Год актуальности</td> <td>{threat.year}</td></tr>
          <tr><td> Описание</td>         <td>{threat.description}</td></tr>
          <tr><td> Меры защиты</td>     <td>{threat.prevention}</td></tr>
        </tbody>
      </table>

      <div className="detail-actions">
        <button className="btn btn-edit" onClick={() => navigate(`/edit/${threat.id}`)}>
           Редактировать
        </button>
        <button className="btn btn-back" onClick={() => navigate('/')}>
          ← К списку угроз
        </button>
      </div>
    </div>
  );
};

export default Detail;
