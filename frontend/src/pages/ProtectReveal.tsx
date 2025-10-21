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
  const [protectResult, setProtectResult] = useState<ProtectResponse | null>(null);
  const [protectLoading, setProtectLoading] = useState(false);

  const [revealInput, setRevealInput] = useState('');
  const [revealUsername, setRevealUsername] = useState('');
  const [revealResult, setRevealResult] = useState<RevealResponse | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const [bulkProtectInput, setBulkProtectInput] = useState('001\n002\n003');
  const [bulkProtectResult, setBulkProtectResult] = useState<any>(null);
  const [bulkProtectLoading, setBulkProtectLoading] = useState(false);

  const handleProtect = async () => {
    setProtectLoading(true);
    setProtectResult(null);
    try {
      const response = await api.post('/api/crdp/protect', {
        data: protectInput,
      });
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
    try {
      const response = await api.post('/api/crdp/reveal', {
        protected_data: revealInput,
        username: revealUsername || undefined,
      });
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
    try {
      const dataArray = bulkProtectInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const response = await api.post('/api/crdp/protect-bulk', {
        data_array: dataArray,
      });
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
      <h1>CRDP Protect/Reveal</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        데이터를 암호화(Protect)하고 복호화(Reveal)하는 API 테스트 페이지입니다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
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
    </div>
  );
}
