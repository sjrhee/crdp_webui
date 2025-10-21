import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

type Item = { id: number; name: string; description?: string };
type ProtectRequestMeta = { url: string; headers: Record<string, string>; body: Record<string, unknown> };
type ProtectSuccess = { request: ProtectRequestMeta; status: number; response: Record<string, unknown> };
type ProtectError = { error?: string } | { detail?: unknown } | ProtectSuccess;
type RevealSuccess = ProtectSuccess;
type RevealError = { error?: string } | { detail?: unknown } | RevealSuccess;

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [protectHost, setProtectHost] = useState<string>('192.168.0.231');
  const [protectPort, setProtectPort] = useState<number>(32082);
  const [protectPolicy, setProtectPolicy] = useState<string>('P03');
  const [protectData, setProtectData] = useState<string>('1234567890123');
  const [protectResult, setProtectResult] = useState<ProtectError | null>(null);
  const [protectLoading, setProtectLoading] = useState<boolean>(false);
  const [revealProtected, setRevealProtected] = useState<string>('');
  const [revealUsername, setRevealUsername] = useState<string>('');
  const [revealVersion, setRevealVersion] = useState<string>('');
  const [revealResult, setRevealResult] = useState<RevealError | null>(null);
  const [revealLoading, setRevealLoading] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
            const res = await api.get('/api/items');
        setItems(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
              const ax = err as AxiosError<{ detail?: string }>;
              setError(ax.response?.data?.detail || '항목을 불러오지 못했습니다');
            } else {
              setError('항목을 불러오지 못했습니다');
            }
      }
    };
    run();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>안녕하세요, {user?.username}</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/protect-reveal" style={{ textDecoration: 'none', color: '#007bff' }}>
            🔒 Protect/Reveal (신규)
          </Link>
          <button onClick={logout}>로그아웃</button>
        </div>
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

      <hr style={{ margin: '24px 0' }} />
      <h3>CRDP Protect 호출</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>
          API 호스트
          <input value={protectHost} onChange={e => setProtectHost(e.target.value)} />
        </label>
        <label>
          API 포트
          <input type="number" value={protectPort} onChange={e => setProtectPort(Number(e.target.value))} />
        </label>
        <label>
          보호 정책 이름
          <input value={protectPolicy} onChange={e => setProtectPolicy(e.target.value)} />
        </label>
        <label>
          데이터
          <input value={protectData} onChange={e => setProtectData(e.target.value)} />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={async () => {
            setProtectLoading(true);
            setProtectResult(null);
            try {
              const res = await api.post('/api/protect', {
                host: protectHost,
                port: protectPort,
                policy: protectPolicy,
                data: protectData,
              });
              setProtectResult(res.data);
            } catch (err) {
              if (axios.isAxiosError(err)) {
                const ax = err as AxiosError<ProtectError>;
                setProtectResult(ax.response?.data ?? { error: ax.message });
              } else {
                setProtectResult({ error: '호출 실패' });
              }
            } finally {
              setProtectLoading(false);
            }
          }}
          disabled={protectLoading}
        >
          {protectLoading ? '호출 중...' : 'Protect 호출'}
        </button>
      </div>
      {protectResult && (
        <pre style={{ background: '#f7f7f7', padding: 12, marginTop: 12, overflow: 'auto' }}>
{JSON.stringify(protectResult, null, 2)}
        </pre>
      )}

      <hr style={{ margin: '24px 0' }} />
      <h3>CRDP Reveal 호출</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>
          API 호스트
          <input value={protectHost} onChange={e => setProtectHost(e.target.value)} />
        </label>
        <label>
          API 포트
          <input type="number" value={protectPort} onChange={e => setProtectPort(Number(e.target.value))} />
        </label>
        <label>
          보호 정책 이름
          <input value={protectPolicy} onChange={e => setProtectPolicy(e.target.value)} />
        </label>
        <label>
          protected_data
          <input value={revealProtected} onChange={e => setRevealProtected(e.target.value)} />
        </label>
        <label>
          username (옵션)
          <input value={revealUsername} onChange={e => setRevealUsername(e.target.value)} />
        </label>
        <label>
          external_version (옵션)
          <input value={revealVersion} onChange={e => setRevealVersion(e.target.value)} />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={async () => {
            setRevealLoading(true);
            setRevealResult(null);
            try {
              const res = await api.post('/api/reveal', {
                host: protectHost,
                port: protectPort,
                policy: protectPolicy,
                protected_data: revealProtected,
                username: revealUsername || undefined,
                external_version: revealVersion || undefined,
              });
              setRevealResult(res.data);
            } catch (err) {
              if (axios.isAxiosError(err)) {
                const ax = err as AxiosError<RevealError>;
                setRevealResult(ax.response?.data ?? { error: ax.message });
              } else {
                setRevealResult({ error: '호출 실패' });
              }
            } finally {
              setRevealLoading(false);
            }
          }}
          disabled={revealLoading}
        >
          {revealLoading ? '호출 중...' : 'Reveal 호출'}
        </button>
      </div>
      {revealResult && (
        <pre style={{ background: '#f7f7f7', padding: 12, marginTop: 12, overflow: 'auto' }}>
{JSON.stringify(revealResult, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Home;
