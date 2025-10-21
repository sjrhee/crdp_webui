import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ProtectReveal } from './pages/ProtectReveal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/protect-reveal" replace />} />
        <Route path="/protect-reveal" element={<ProtectReveal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
