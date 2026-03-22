import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home   from './pages/Home';
import Detail from './pages/Detail';
import Form   from './pages/Form';
import './App.css';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-logo">КиберБезопасность</Link>
        <Link to="/add" className="nav-btn">+ Добавить угрозу</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/"           element={<Home />}   />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/add"        element={<Form />}   />
          <Route path="/edit/:id"   element={<Form />}   />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
