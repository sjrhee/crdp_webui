import { useState } from 'react';
import api from '../lib/api';
import type { AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

interface ApiResponse {
  status_code: number;
  error?: string;
  debug?: Record<string, unknown>;
}

interface ProtectResponse extends ApiResponse {
  protected_data?: string;
}

interface RevealResponse extends ApiResponse {
  data?: string;
}

interface BulkProtectResponse extends ApiResponse {
  protected_data_array?: string[];
}

interface BulkRevealResponse extends ApiResponse {
  data_array?: string[];
}

type ProgressEntry =
  | { stage: 'protect'; debug?: Record<string, unknown> }
  | { stage: 'reveal'; debug?: Record<string, unknown> }
  | { stage: 'protect_bulk'; debug?: Record<string, unknown> }
  | { stage: 'reveal_bulk'; debug?: Record<string, unknown> }
  | { stage: 'health'; debug?: Record<string, unknown> };

interface Config {
  host: string;
  port: string;
  policy: string;
}

// ============================================================================
// Components
// ============================================================================

/** 설정 입력 섹션 */
function ConfigSection({
  config,
  onConfigChange,
  onReset,
  onHealthCheck,
  healthStatus,
}: {
  config: Config;
  onConfigChange: (key: keyof Config, value: string) => void;
  onReset: () => void;
  onHealthCheck: () => void;
  healthStatus?: { ok: boolean; msg: string } | null;
}) {
  return (
    <div className="card grid-span-2">
      <div className="card-body">
        <div className="form-row">
          <div className="form-group" style={{ minWidth: 160 }}>
            <label>CRDP IP</label>
            <input
              value={config.host}
              onChange={(e) => onConfigChange('host', e.target.value)}
              placeholder="예: 192.168.0.231"
            />
          </div>
          <div className="form-group" style={{ minWidth: 120 }}>
            <label>CRDP Port</label>
            <input
              value={config.port}
              onChange={(e) => onConfigChange('port', e.target.value)}
              placeholder="예: 32082"
            />
          </div>
          <div className="form-group" style={{ minWidth: 120 }}>
            <label>Policy</label>
            <input
              value={config.policy}
              onChange={(e) => onConfigChange('policy', e.target.value)}
              placeholder="예: P03"
            />
          </div>
          <div className="spacer" />
          <div className="actions">
            <button onClick={onHealthCheck} className="btn btn-success" style={{ marginRight: 8 }}>
              Health Check
            </button>
            {healthStatus && (
              <span
                className="muted"
                style={{
                  marginRight: 12,
                  color: healthStatus.ok ? '#16a34a' : '#dc2626',
                  fontWeight: 600,
                }}
                title={healthStatus.msg}
              >
                {healthStatus.ok ? 'Healthy' : 'Unhealthy'}
              </span>
            )}
            <button onClick={onReset} className="btn btn-secondary">
              리셋
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 단일 입력/결과 표시 컴포넌트 */
function SingleResultBox({
  label,
  value,
  error,
  statusCode,
}: {
  label: string;
  value?: string;
  error?: string;
  statusCode?: number;
}) {
  if (!value && !error) return null;

  return (
    <div className={`status-box ${error ? 'status-err' : 'status-ok'}`}>
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="tag">Status</span>
        <div>{statusCode}</div>
      </div>
      {value && (
        <div>
          <div className="row" style={{ marginBottom: 6 }}>
            <span className="tag">{label}</span>
            <div className="spacer" />
            <button
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(value)}
            >
              복사
            </button>
          </div>
          <div className="code-box">{value}</div>
        </div>
      )}
      {error && (
        <div className="row" style={{ color: '#fca5a5' }}>
          <span className="tag">Error</span>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}

/** 배열 결과 표시 컴포넌트 */
function ArrayResultBox({
  label,
  array,
  error,
  statusCode,
}: {
  label: string;
  array?: string[];
  error?: string;
  statusCode?: number;
}) {
  if (!array && !error) return null;

  return (
    <div className={`status-box ${error ? 'status-err' : 'status-ok'}`}>
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="tag">Status</span>
        <div>{statusCode}</div>
      </div>
      {array && (
        <div>
          <div className="row" style={{ marginBottom: 6 }}>
            <span className="tag">{label}</span>
            <div className="spacer" />
            <span className="muted">{array.length}개</span>
          </div>
          <div className="code-box" style={{ maxHeight: 220, overflow: 'auto' }}>
            {array.map((item: string, idx: number) => (
              <div key={idx} style={{ padding: '4px 0' }}>
                {idx + 1}. {item}
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="row" style={{ color: '#fca5a5' }}>
          <span className="tag">Error</span>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProtectReveal() {
  // Config state
  const [config, setConfig] = useState<Config>({
    host: '192.168.0.231',
    port: '32082',
    policy: 'P03',
  });

  // Protect state
  const [protectInput, setProtectInput] = useState('1234567890123');
  const [protectResult, setProtectResult] = useState<ProtectResponse | null>(null);
  const [protectLoading, setProtectLoading] = useState(false);

  // Reveal state
  const [revealInput, setRevealInput] = useState('');
  const [revealResult, setRevealResult] = useState<RevealResponse | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  // Bulk Protect state
  const [bulkProtectInput, setBulkProtectInput] = useState(
    '1234567890123\n1234567890124\n1234567890125'
  );
  const [bulkProtectResult, setBulkProtectResult] = useState<BulkProtectResponse | null>(null);
  const [bulkProtectLoading, setBulkProtectLoading] = useState(false);

  // Bulk Reveal state
  const [bulkRevealInput, setBulkRevealInput] = useState('');
  const [bulkRevealResult, setBulkRevealResult] = useState<BulkRevealResponse | null>(null);
  const [bulkRevealLoading, setBulkRevealLoading] = useState(false);

  // Progress log
  const [progressLog, setProgressLog] = useState<ProgressEntry[]>([]);
  const [healthStatus, setHealthStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // =========================================================================
  // Utility Functions
  // =========================================================================

  const parseError = (e: unknown): { status: number; message: string } => {
    if (typeof e === 'object' && e !== null) {
      const err = e as AxiosError<{ detail?: string }>;
      const status = err.response?.status ?? 500;
      const message = err.response?.data?.detail ?? err.message ?? 'Unknown error';
      return { status, message };
    }
    return { status: 500, message: String(e) };
  };

  const addProgress = (stage: ProgressEntry['stage'], debug?: Record<string, unknown>) => {
    setProgressLog((p) => [...p, { stage, debug }]);
  };

  const resetAll = () => {
    setProtectInput('1234567890123');
    setRevealInput('');
    setBulkProtectInput('1234567890123\n1234567890124\n1234567890125');
    setProtectResult(null);
    setRevealResult(null);
    setBulkProtectResult(null);
    setBulkRevealResult(null);
    setBulkRevealInput('');
    setProgressLog([]);
  };

  const handleConfigChange = (key: keyof Config, value: string) => {
    setConfig((c) => ({ ...c, [key]: value }));
  };

  const handleHealthCheck = async () => {
    try {
      const res = await api.get('/api/crdp/health', {
        params: {
          host: config.host,
          port: parseInt(config.port, 10),
          policy: config.policy,
        },
      });
      addProgress('health', res.data);
      const { status, crdp_api_host, crdp_api_port, protection_policy } = res.data || {};
      setHealthStatus({
        ok: String(status).toLowerCase() === 'healthy',
        msg: `host=${crdp_api_host}, port=${crdp_api_port}, policy=${protection_policy}`,
      });
    } catch (e: unknown) {
      const err = (e as any)?.message ?? 'health check failed';
      setHealthStatus({ ok: false, msg: String(err) });
      addProgress('health', { error: String(err) });
    }
  };

  // =========================================================================
  // API Handler Functions
  // =========================================================================

  const handleProtect = async () => {
    setProtectLoading(true);
    setProtectResult(null);
    setProgressLog([]);
    try {
      if (!/^[0-9]{13}$/.test(protectInput)) {
        throw new Error('입력은 정확히 13자리 숫자여야 합니다.');
      }

      const response = await api.post('/api/crdp/protect', {
        data: protectInput,
        policy: config.policy,
        host: config.host,
        port: parseInt(config.port, 10),
      });
      addProgress('protect', response.data?.debug);
      setProtectResult(response.data);
      if (response.data.protected_data) {
        setRevealInput(response.data.protected_data);
      }
    } catch (error: unknown) {
      const info = parseError(error);
      setProtectResult({ status_code: info.status, error: info.message });
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
        policy: config.policy,
        host: config.host,
        port: parseInt(config.port, 10),
      });
      addProgress('reveal', response.data?.debug);
      setRevealResult(response.data);
    } catch (error: unknown) {
      const info = parseError(error);
      setRevealResult({ status_code: info.status, error: info.message });
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
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const response = await api.post('/api/crdp/protect-bulk', {
        data_array: dataArray,
        policy: config.policy,
        host: config.host,
        port: parseInt(config.port, 10),
      });
      addProgress('protect_bulk', response.data?.debug);
      setBulkProtectResult(response.data);
      if (response.data?.protected_data_array && Array.isArray(response.data.protected_data_array)) {
        setBulkRevealInput(response.data.protected_data_array.join('\n'));
      }
    } catch (error: unknown) {
      const info = parseError(error);
      setBulkProtectResult({ status_code: info.status, error: info.message });
    } finally {
      setBulkProtectLoading(false);
    }
  };

  const handleBulkReveal = async () => {
    setBulkRevealLoading(true);
    setBulkRevealResult(null);
    setProgressLog([]);
    try {
      const protectedArray = bulkRevealInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const response = await api.post('/api/crdp/reveal-bulk', {
        protected_data_array: protectedArray,
        policy: config.policy,
        host: config.host,
        port: parseInt(config.port, 10),
      });
      addProgress('reveal_bulk', response.data?.debug);
      setBulkRevealResult(response.data);
    } catch (error: unknown) {
      const info = parseError(error);
      setBulkRevealResult({ status_code: info.status, error: info.message });
    } finally {
      setBulkRevealLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <span className="brand-dot" />
          <div className="brand-title">CRDP Protect/Reveal</div>
          <div className="spacer" />
          <span className="tag">미니멀 테스트 도구</span>
        </div>
      </header>
      <main className="container">
        <h1 className="page-title">Protect / Reveal</h1>
        <p className="page-desc">데이터 암호화/복호화를 빠르게 검증하는 간단한 도구입니다.</p>

        <div className="grid-2">
          <ConfigSection
            config={config}
            onConfigChange={handleConfigChange}
            onReset={resetAll}
            onHealthCheck={handleHealthCheck}
            healthStatus={healthStatus}
          />

          <div className="card">
            <div className="card-body">
              <h2>🔒 Protect (암호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>원본 데이터</label>
                <input
                  type="text"
                  value={protectInput}
                  onChange={(e) => setProtectInput(e.target.value)}
                  placeholder="암호화할 데이터 입력"
                />
              </div>
              <button onClick={handleProtect} disabled={protectLoading || !protectInput} className="btn btn-primary">
                {protectLoading ? '처리 중...' : 'Protect 실행'}
              </button>

              {protectResult && (
                <SingleResultBox
                  label="Protected Data"
                  value={protectResult.protected_data}
                  error={protectResult.error}
                  statusCode={protectResult.status_code}
                />
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>🔓 Reveal (복호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Protected Data</label>
                <input
                  type="text"
                  value={revealInput}
                  onChange={(e) => setRevealInput(e.target.value)}
                  placeholder="복호화할 데이터 입력"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
                />
              </div>
              <button onClick={handleReveal} disabled={revealLoading || !revealInput} className="btn btn-success">
                {revealLoading ? '처리 중...' : 'Reveal 실행'}
              </button>

              {revealResult && (
                <SingleResultBox
                  label="Revealed Data"
                  value={revealResult.data}
                  error={revealResult.error}
                  statusCode={revealResult.status_code}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <div className="card-body">
              <h2>📦 Bulk Protect (대량 암호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>데이터 배열 (한 줄에 하나씩)</label>
                <textarea
                  value={bulkProtectInput}
                  onChange={(e) => setBulkProtectInput(e.target.value)}
                  placeholder="암호화할 데이터를 한 줄씩 입력"
                  rows={5}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
                />
              </div>
              <button onClick={handleBulkProtect} disabled={bulkProtectLoading || !bulkProtectInput.trim()} className="btn btn-purple">
                {bulkProtectLoading ? '처리 중...' : 'Bulk Protect 실행'}
              </button>

              {bulkProtectResult && (
                <ArrayResultBox
                  label="Protected Data"
                  array={bulkProtectResult.protected_data_array}
                  error={bulkProtectResult.error}
                  statusCode={bulkProtectResult.status_code}
                />
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2>📦 Bulk Reveal (대량 복호화)</h2>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Protected Data Array (한 줄에 하나씩)</label>
                <textarea
                  value={bulkRevealInput}
                  onChange={(e) => setBulkRevealInput(e.target.value)}
                  placeholder="복호화할 데이터를 한 줄씩 입력"
                  rows={5}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
                />
              </div>
              <button onClick={handleBulkReveal} disabled={bulkRevealLoading || !bulkRevealInput.trim()} className="btn btn-success">
                {bulkRevealLoading ? '처리 중...' : 'Bulk Reveal 실행'}
              </button>

              {bulkRevealResult && (
                <ArrayResultBox
                  label="Revealed Data"
                  array={bulkRevealResult.data_array}
                  error={bulkRevealResult.error}
                  statusCode={bulkRevealResult.status_code}
                />
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>진행 로그 (Progress)</h3>
          <pre
            className="code-box"
            style={{ overflow: 'auto', maxHeight: 260, textAlign: 'left' }}
          >
            {JSON.stringify(progressLog, null, 2)}
          </pre>
        </div>
      </main>
    </>
  );
}
