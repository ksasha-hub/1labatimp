import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getThreatById, createThreat, updateThreat } from '../api/threatsApi';

const emptyForm = {
  name: '', category: '', severity: '',
  year: new Date().getFullYear(),
  description: '', prevention: '',
};

const CATEGORIES = [
  'Социальная инженерия', 'Вредоносное ПО', 'Сетевая атака',
  'Атака на приложение',  'Утечка информации', 'Физическая угроза',
  'Криптоатака',          'Другое',
];

const SEVERITIES = ['Критическая', 'Высокая', 'Средняя', 'Низкая'];

const Form = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id); 

  const [formData,    setFormData]    = useState(emptyForm);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getThreatById(id)
      .then(res => { setFormData(res.data); setLoading(false); })
      .catch(err => {
        const status = err.response?.status;
        setServerError(status === 404
          ? 'Угроза не найдена (404).'
          : `Ошибка загрузки: ${err.message}`);
        setLoading(false);
      });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); 
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim())
      errs.name = 'Название угрозы обязательно';
    if (!formData.category)
      errs.category = 'Выберите категорию';
    if (!formData.severity)
      errs.severity = 'Выберите уровень угрозы';
    if (!formData.year)
      errs.year = 'Год обязателен';
    else if (formData.year < 1990 || formData.year > new Date().getFullYear())
      errs.year = `Год должен быть от 1990 до ${new Date().getFullYear()}`;
    if (!formData.description.trim())
      errs.description = 'Описание обязательно';
    if (!formData.prevention.trim())
      errs.prevention = 'Меры защиты обязательны';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const threatData = {
      name:        formData.name.trim(),
      category:    formData.category,
      severity:    formData.severity,
      year:        Number(formData.year),
      description: formData.description.trim(),
      prevention:  formData.prevention.trim(),
    };

    setLoading(true);

    const request = isEdit
      ? updateThreat(id, threatData) 
      : createThreat(threatData);     

    request
      .then(() => navigate('/'))      
      .catch(err => {
        const status = err.response?.status;
        if      (status === 404)   setServerError('Ошибка 404: запись не найдена.');
        else if (status === 400)   setServerError('Ошибка 400: неверные данные запроса.');
        else if (status >= 500)    setServerError('Ошибка сервера (5xx). Попробуйте позже.');
        else                       setServerError(`Ошибка: ${err.message}`);
        setLoading(false);
      });
  };

  if (loading && isEdit) return <div className="spinner"> Загрузка данных...</div>;

  return (
    <div className="form-card">
      <h1 className="form-title">
        {isEdit ? 'Редактирование угрозы' : ' Добавление новой угрозы'}
      </h1>

      {serverError && <div className="error-box"> {serverError}</div>}

      <form onSubmit={handleSubmit} noValidate>

        {}
        <div className="form-group">
          <label className="form-label">Название угрозы *</label>
          <input type="text" name="name" value={formData.name}
            onChange={handleChange} placeholder="Например: Фишинг, Ransomware..."
            className={`form-input${errors.name ? ' error' : ''}`} />
          {errors.name && <span className="form-error"> {errors.name}</span>}
        </div>

        {}
        <div className="form-group">
          <label className="form-label">Категория *</label>
          <select name="category" value={formData.category} onChange={handleChange}
            className={`form-select${errors.category ? ' error' : ''}`}>
            <option value="">— Выберите категорию —</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className="form-error"> {errors.category}</span>}
        </div>

        {}
        <div className="form-group">
          <label className="form-label">Уровень угрозы *</label>
          <select name="severity" value={formData.severity} onChange={handleChange}
            className={`form-select${errors.severity ? ' error' : ''}`}>
            <option value="">— Выберите уровень —</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.severity && <span className="form-error"> {errors.severity}</span>}
        </div>

        {}
        <div className="form-group">
          <label className="form-label">Год актуальности *</label>
          <input type="number" name="year" value={formData.year}
            onChange={handleChange} min="1990" max={new Date().getFullYear()}
            className={`form-input${errors.year ? ' error' : ''}`} />
          {errors.year && <span className="form-error"> {errors.year}</span>}
        </div>

        {}
        <div className="form-group">
          <label className="form-label">Описание угрозы *</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            placeholder="Подробное описание угрозы и механизма её действия..."
            className={`form-textarea${errors.description ? ' error' : ''}`} />
          {errors.description && <span className="form-error"> {errors.description}</span>}
        </div>

        {}
        <div className="form-group">
          <label className="form-label">Меры защиты *</label>
          <textarea name="prevention" value={formData.prevention} onChange={handleChange}
            placeholder="Рекомендации по предотвращению и защите..."
            className={`form-textarea${errors.prevention ? ' error' : ''}`} />
          {errors.prevention && <span className="form-error"> {errors.prevention}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-save" disabled={loading}>
            {loading ? ' Сохраняем...' : ' Сохранить'}
          </button>
          <Link to="/" className="btn-cancel">Отмена</Link>
        </div>
      </form>
    </div>
  );
};

export default Form;
