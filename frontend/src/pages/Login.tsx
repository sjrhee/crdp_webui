import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.detail || '로그인 실패');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>로그인</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
