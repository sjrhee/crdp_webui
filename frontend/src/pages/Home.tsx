import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type Item = { id: number; name: string; description?: string };

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get('/api/items');
        setItems(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || '항목을 불러오지 못했습니다');
      }
    };
    run();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>안녕하세요, {user?.username}</h2>
        <button onClick={logout}>로그아웃</button>
      </div>
      <h3>아이템</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {items.map(i => (
          <li key={i.id}>
            <strong>{i.name}</strong> — {i.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
