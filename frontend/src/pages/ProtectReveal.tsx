import { useState } from 'react';
import api from '../lib/api';

interface ProtectResponse {
  status_code: number;
  protected_data?: string;
  error?: string;
}

interface RevealResponse {
  status_code: number;
  data?: string;
  error?: string;
}

export function ProtectReveal() {
  const [protectInput, setProtectInput] = useState('1234567890123');
  const [host, setHost] = useState('192.168.0.241');
  const [port, setPort] = useState('80');
  const [policy, setPolicy] = useState('P03');
  const [protectResult, setProtectResult] = useState<ProtectResponse | null>(null);
  const [protectLoading, setProtectLoading] = useState(false);

  const [revealInput, setRevealInput] = useState('');
  const [revealUsername, setRevealUsername] = useState('');
  const [revealResult, setRevealResult] = useState<RevealResponse | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const [bulkProtectInput, setBulkProtectInput] = useState('001\n002\n003');
  const [bulkProtectResult, setBulkProtectResult] = useState<any>(null);
  const [bulkProtectLoading, setBulkProtectLoading] = useState(false);
  const [progressLog, setProgressLog] = useState<any[]>([]);

  const handleProtect = async () => {
    setProtectLoading(true);
    setProtectResult(null);
    setProgressLog([]);
    try {
      // Validate 13-digit numeric input
      if (!/^[0-9]{13}$/.test(protectInput)) {
        throw new Error('입력은 정확히 13자리 숫자여야 합니다.');
      }

      const response = await api.post('/api/crdp/protect', {
        data: protectInput,
        policy,
        host,
        port: parseInt(port),
      });
      // push progress
      setProgressLog((p) => [...p, { stage: 'protect', request: { protection_policy_name: policy, data: protectInput }, response: response.data }]);
      setProtectResult(response.data);
      
      // Auto-fill reveal input with protected token
      if (response.data.protected_data) {
        setRevealInput(response.data.protected_data);
      }
    } catch (error: any) {
      setProtectResult({
        status_code: error.response?.status || 500,
        error: error.response?.data?.detail || error.message,
      });
    } finally {
      setProtectLoading(false);
    }
  };

  const handleReveal = async () => {
    setRevealLoading(true);
    setRevealResult(null);
    // keep progress log
    try {
      const response = await api.post('/api/crdp/reveal', {
        protected_data: revealInput,
        username: revealUsername || undefined,
        policy,
        host,
        port: parseInt(port),
      });
      setProgressLog((p) => [...p, { stage: 'reveal', request: { protection_policy_name: policy, protected_data: revealInput }, response: response.data }]);
      setRevealResult(response.data);
    } catch (error: any) {
      setRevealResult({
        status_code: error.response?.status || 500,
        error: error.response?.data?.detail || error.message,
      });
    } finally {
      setRevealLoading(false);
    }
  };

  const handleBulkProtect = async () => {
    setBulkProtectLoading(true);
    setBulkProtectResult(null);
    setProgressLog([]);
    try {
      const dataArray = bulkProtectInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      const response = await api.post('/api/crdp/protect-bulk', {
        data_array: dataArray,
        policy,
        host,
        port: parseInt(port),
      });
      setProgressLog((p) => [...p, { stage: 'protect_bulk', request: { protection_policy_name: policy, data_array: dataArray }, response: response.data }]);
      setBulkProtectResult(response.data);
    } catch (error: any) {
      setBulkProtectResult({
        status_code: error.response?.status || 500,
        error: error.response?.data?.detail || error.message,
      });
    } finally {
      setBulkProtectLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 1rem 0' }}>CRDP Protect/Reveal</h1>
      <p style={{ color: '#666', marginTop: 0 }}>데이터 암호화/복호화 테스트 도구 (인증 없음)</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Config inputs (host/port/policy) */}
        <div style={{ gridColumn: '1 / span 2', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ color: '#666' }}>CRDP IP</label>
            <input value={host} onChange={(e) => setHost(e.target.value)} style={{ width: '180px', padding: '0.4rem' }} />
            <label style={{ color: '#666' }}>CRDP Port</label>
            <input value={port} onChange={(e) => setPort(e.target.value)} style={{ width: '120px', padding: '0.4rem' }} />
            <label style={{ color: '#666' }}>Policy</label>
            <input value={policy} onChange={(e) => setPolicy(e.target.value)} style={{ width: '120px', padding: '0.4rem' }} />
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={() => { setProtectInput('1234567890123'); setRevealInput(''); setBulkProtectInput('001\n002\n003'); setProtectResult(null); setRevealResult(null); setBulkProtectResult(null); setProgressLog([]); }}
                className="secondary"
                style={{ padding: '0.5rem 0.75rem', backgroundColor: '#334155', color: 'white', borderRadius: '6px', border: 'none' }}
              >
                리셋
              </button>
            </div>
          </div>
        </div>
        {/* Protect Section */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>🔒 Protect (암호화)</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              원본 데이터:
            </label>
            <input
              type="text"
              value={protectInput}
              onChange={(e) => setProtectInput(e.target.value)}
              placeholder="암호화할 데이터 입력"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
          <button
            onClick={handleProtect}
            disabled={protectLoading || !protectInput}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: protectLoading || !protectInput ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: protectLoading || !protectInput ? 0.6 : 1,
            }}
          >
            {protectLoading ? '처리 중...' : 'Protect 실행'}
          </button>

          {protectResult && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: protectResult.error ? '#fee' : '#efe',
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Status:</strong> {protectResult.status_code}
              </div>
              {protectResult.protected_data && (
                <div style={{ wordBreak: 'break-all' }}>
                  <strong>Protected Token:</strong>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    }}
                  >
                    {protectResult.protected_data}
                  </div>
                </div>
              )}
              {protectResult.error && (
                <div style={{ color: 'red' }}>
                  <strong>Error:</strong> {protectResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reveal Section */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>🔓 Reveal (복호화)</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Protected Token:
            </label>
            <input
              type="text"
              value={revealInput}
              onChange={(e) => setRevealInput(e.target.value)}
              placeholder="복호화할 토큰 입력"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'monospace',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Username (선택):
            </label>
            <input
              type="text"
              value={revealUsername}
              onChange={(e) => setRevealUsername(e.target.value)}
              placeholder="감사 추적용 사용자명"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
          <button
            onClick={handleReveal}
            disabled={revealLoading || !revealInput}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: revealLoading || !revealInput ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: revealLoading || !revealInput ? 0.6 : 1,
            }}
          >
            {revealLoading ? '처리 중...' : 'Reveal 실행'}
          </button>

          {revealResult && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: revealResult.error ? '#fee' : '#efe',
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Status:</strong> {revealResult.status_code}
              </div>
              {revealResult.data && (
                <div>
                  <strong>Revealed Data:</strong>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    }}
                  >
                    {revealResult.data}
                  </div>
                </div>
              )}
              {revealResult.error && (
                <div style={{ color: 'red' }}>
                  <strong>Error:</strong> {revealResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Protect Section */}
      <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
        <h2>📦 Bulk Protect (대량 암호화)</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            데이터 배열 (한 줄에 하나씩):
          </label>
          <textarea
            value={bulkProtectInput}
            onChange={(e) => setBulkProtectInput(e.target.value)}
            placeholder="암호화할 데이터를 한 줄씩 입력"
            rows={5}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'monospace',
            }}
          />
        </div>
        <button
          onClick={handleBulkProtect}
          disabled={bulkProtectLoading || !bulkProtectInput.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: bulkProtectLoading || !bulkProtectInput.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            opacity: bulkProtectLoading || !bulkProtectInput.trim() ? 0.6 : 1,
          }}
        >
          {bulkProtectLoading ? '처리 중...' : 'Bulk Protect 실행'}
        </button>

        {bulkProtectResult && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: bulkProtectResult.error ? '#fee' : '#efe',
              borderRadius: '4px',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Status:</strong> {bulkProtectResult.status_code}
            </div>
            {bulkProtectResult.protected_data_array && (
              <div>
                <strong>Protected Tokens ({bulkProtectResult.protected_data_array.length}):</strong>
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  {bulkProtectResult.protected_data_array.map((token: string, idx: number) => (
                    <div key={idx} style={{ padding: '0.25rem 0' }}>
                      {idx + 1}. {token}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bulkProtectResult.error && (
              <div style={{ color: 'red' }}>
                <strong>Error:</strong> {bulkProtectResult.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress JSON and Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h3>진행 JSON</h3>
          <pre style={{ background: '#0b1220', color: '#d1fae5', minHeight: '160px', maxHeight: '420px', overflow: 'auto', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937' }}>
            {JSON.stringify(progressLog, null, 2)}
          </pre>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h3>결과</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#666' }}>암호문(Protected):</span>
              <code style={{ marginLeft: 'auto', fontFamily: 'monospace' }}>{protectResult?.protected_data ?? '-'}</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#666' }}>복호문(Revealed):</span>
              <code style={{ marginLeft: 'auto', fontFamily: 'monospace' }}>{revealResult?.data ?? '-'}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
