# Frontend - CRDP React Web UI# Frontend - React + Vite + TypeScript WebUI# React + TypeScript + Vite



React 19 + Vite + TypeScript 기반 대화형 웹 인터페이스



---Vite + React 19 + TypeScript로 구축한 CRDP Protect/Reveal 웹 UI입니다.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 빠른 시작



### 1. 설치---Currently, two official plugins are available:



```bash

npm install

```## 🏗️ 구조- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh



### 2. 개발 서버- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



```bash```

npm run dev

```frontend/## React Compiler



접속: http://localhost:5173/protect-reveal├── src/



### 3. 프로덕션 빌드│   ├── main.tsx                 # React 진입점The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).



```bash│   ├── App.tsx                  # 메인 앱 컴포넌트

npm run build

npm run preview  # 빌드 결과 미리보기│   ├── App.css## Expanding the ESLint configuration

```

│   ├── index.css                # 전역 스타일 (디자인 시스템)

---

│   ├── index.htmlIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

## 🎨 주요 기능

│   ├── pages/

| 기능 | 설명 |

|------|------|│   │   └── ProtectReveal.tsx    # Protect/Reveal 페이지 (메인)```js

| **Protect** | 13자리 숫자 암호화 |

| **Reveal** | 암호화된 토큰 복호화 |│   ├── components/export default defineConfig([

| **Bulk Protect** | 여러 데이터 한 번에 암호화 |

| **Bulk Reveal** | 여러 토큰 한 번에 복호화 |│   │   └── ProtectedRoute.tsx   # (참고: 현재 미사용)  globalIgnores(['dist']),

| **Progress Log** | 백엔드↔CRDP 통신 로그 |

| **설정 저장** | IP, Port, Policy 자동 저장 |│   ├── contexts/  {



---│   │   └── AuthContext.tsx      # (참고: 현재 미사용)    files: ['**/*.{ts,tsx}'],



## 📂 구조│   ├── lib/    extends: [



```│   │   └── api.ts              # Axios API 클라이언트      // Other configs...

frontend/

├── src/│   └── assets/

│   ├── main.tsx                   # 진입점

│   ├── App.tsx                    # 라우터├── public/      // Remove tseslint.configs.recommended and replace with this

│   ├── App.css                    # 글로벌 스타일

│   ├── index.css                  # 디자인 시스템├── package.json      tseslint.configs.recommendedTypeChecked,

│   ├── lib/

│   │   └── api.ts                 # Axios 클라이언트├── vite.config.ts              # Vite 설정      // Alternatively, use this for stricter rules

│   ├── pages/

│   │   └── ProtectReveal.tsx       # 메인 페이지├── tsconfig.json               # TypeScript 설정      tseslint.configs.strictTypeChecked,

│   ├── components/

│   │   └── ProtectedRoute.tsx      # 라우트 보호├── tsconfig.app.json           # App TypeScript 설정      // Optionally, add this for stylistic rules

│   └── contexts/

│       └── AuthContext.tsx         # 인증 상태├── tsconfig.node.json          # Node TypeScript 설정      tseslint.configs.stylisticTypeChecked,

├── public/                        # 정적 파일

├── package.json├── eslint.config.js            # ESLint 설정

├── vite.config.ts

├── tsconfig.json├── nginx.conf                  # Nginx 설정 (프로덕션)      // Other configs...

├── Dockerfile

└── nginx.conf├── Dockerfile                  # 컨테이너 이미지    ],

```

└── README.md                   # 이 파일    languageOptions: {

---

```      parserOptions: {

## 🧩 컴포넌트

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

### ProtectReveal.tsx

---        tsconfigRootDir: import.meta.dirname,

메인 페이지 - 4개의 주요 섹션으로 구성:

      },

#### 1. ConfigSection

```tsx## 🚀 빠른 시작      // other options...

// IP, Port, Policy 입력

- IP 주소 입력 필드 (기본: 192.168.0.231)    },

- 포트 입력 필드 (기본: 32082)

- 정책 선택 드롭다운 (기본: P03)### 로컬 개발 환경  },

- 자동 저장 (localStorage)

```])



#### 2. SingleResultBox#### 1. 의존성 설치```

```tsx

// 단일 데이터 처리 결과```bash

- 입력 값 표시

- 결과 값 복사 버튼cd frontendYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

- 시간 정보

```npm install



#### 3. ArrayResultBox``````js

```tsx

// 대량 데이터 처리 결과// eslint.config.js

- 결과 테이블 표시

- 각 항목 복사 버튼#### 2. 환경 변수 설정 (선택)import reactX from 'eslint-plugin-react-x'

- 전체 다운로드 (JSON)

``````bashimport reactDom from 'eslint-plugin-react-dom'



#### 4. ProgressLog# .env (또는 .env.local)

```tsx

// API 통신 상세 정보VITE_API_BASE_URL=http://localhost:8000export default defineConfig([

- 요청 URL

- 요청/응답 페이로드```  globalIgnores(['dist']),

- 헤더 정보

- HTTP 상태 코드  {

```

#### 3. 개발 서버 시작    files: ['**/*.{ts,tsx}'],

---

```bash    extends: [

## 🌐 API 클라이언트

npm run dev      // Other configs...

**`lib/api.ts`**:

```      // Enable lint rules for React

```typescript

// Base URL 설정      reactX.configs['recommended-typescript'],

const client = createClient(ip: string, port: number)

#### 4. 접속      // Enable lint rules for React DOM

// Protect/Reveal 호출

await client.protect(data, policy)- **WebUI**: http://localhost:5173/protect-reveal      reactDom.configs.recommended,

await client.reveal(protectedData, policy)

await client.protectBulk(dataList, policy)- **HMR (Hot Module Reload)**: 활성화됨    ],

await client.revealBulk(protectedDataList, policy)

```    languageOptions: {



------      parserOptions: {



## 🎨 디자인 시스템        project: ['./tsconfig.node.json', './tsconfig.app.json'],



**`index.css`** 에서 정의:## 📦 주요 스크립트        tsconfigRootDir: import.meta.dirname,



```css      },

/* 색상 */

--color-primary: #007bff```bash      // other options...

--color-success: #28a745

--color-danger: #dc3545# 개발 서버 시작    },

--color-border: #dee2e6

--color-bg: #f8f9fanpm run dev  },



/* 타이포그래피 */])

--font-family: system-ui, -apple-system, sans-serif

--font-size-base: 14px# 프로덕션 빌드```

--font-size-lg: 18px

npm run build

/* 간격 */

--space-xs: 4px# Lint 실행

--space-sm: 8pxnpm run lint

--space-md: 16px

--space-lg: 24px# 타입 체크

```npm run check

```

---

---

## 📦 의존성

## 🎯 주요 기능 및 컴포넌트

- **react** - UI 라이브러리

- **react-dom** - React 렌더링### 1. ProtectReveal 페이지 (`src/pages/ProtectReveal.tsx`)

- **axios** - HTTP 클라이언트

- **vite** - 빌드 도구**기능:**

- **typescript** - 타입 안전성- 🔒 **Protect (암호화)**: 단일 13자리 숫자 암호화

- 🔓 **Reveal (복호화)**: 보호된 토큰 복호화

---- 📦 **Bulk Protect (대량 암호화)**: 여러 데이터 한 번에 암호화

- 📦 **Bulk Reveal (대량 복호화)**: 여러 토큰 한 번에 복호화

## 🛠️ 개발 명령어- 🔍 **Progress Log**: 백엔드↔CRDP 통신 로그 표시



```bash**구조:**

# 개발 서버 실행```typescript

npm run dev// Types

interface ApiResponse { status_code, error, debug }

# 프로덕션 빌드interface ProtectResponse extends ApiResponse { protected_data }

npm run buildinterface RevealResponse extends ApiResponse { data }

interface BulkProtectResponse extends ApiResponse { protected_data_array }

# 타입 체크interface BulkRevealResponse extends ApiResponse { data_array }

npm run type-checktype ProgressEntry = { stage, debug }



# Lint (있으면)// Components (분리됨)

npm run lint- ConfigSection: 설정(IP, Port, Policy) 입력

- SingleResultBox: 단일 결과 표시

# 빌드 결과 미리보기- ArrayResultBox: 배열 결과 표시

npm run preview

```// Main Component

- ProtectReveal: 메인 페이지 로직

---```



## 🐳 Docker 빌드**자동 연결:**

- Protect → 결과가 Reveal 입력칸에 자동 채워짐

```bash- Bulk Protect → 결과가 Bulk Reveal 입력칸에 자동 채워짐

TAG=$(date +%Y%m%d-%H%M%S)

docker build -t 192.168.0.231:5001/frontend:$TAG -f frontend/Dockerfile frontend### 2. API 클라이언트 (`src/lib/api.ts`)

docker push 192.168.0.231:5001/frontend:$TAG

echo "Image: 192.168.0.231:5001/frontend:$TAG"```typescript

```import axios from 'axios';



---const api = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

## 🌍 환경 설정});



**`vite.config.ts`**:export default api;

```

```typescript

export default defineConfig({**사용 예:**

  plugins: [react()],```typescript

  server: {const response = await api.post('/api/crdp/protect', {

    proxy: {  data: '1234567890123',

      '/api': {  policy: 'P03'

        target: 'http://backend:8000',});

        changeOrigin: true```

      }

    }### 3. 디자인 시스템 (`src/index.css`)

  }

})**CSS Variables:**

``````css

/* Colors */

-----color-primary: #0066cc

--color-success: #00aa00

## 💾 상태 관리--color-danger: #ff4444

--color-warning: #ffaa00

### ConfigSection 상태--color-bg: #ffffff

--color-text: #333333

```typescript--color-border: #cccccc

const [config, setConfig] = useState({

  ip: localStorage.getItem('config_ip') || '192.168.0.231',/* Spacing, Typography, etc. */

  port: parseInt(localStorage.getItem('config_port') || '32082'),```

  policy: localStorage.getItem('config_policy') || 'P03'

})**컴포넌트 클래스:**

- `.card`: 카드 스타일 컨테이너

// 변경 시 자동 저장- `.btn`, `.btn-primary`, `.btn-success`, etc.: 버튼 스타일

useEffect(() => {- `.status-box`: 상태 표시 박스

  localStorage.setItem('config_ip', config.ip)- `.code-box`: 코드/텍스트 표시 박스

  localStorage.setItem('config_port', config.port.toString())- `.grid-2`: 2열 그리드

  localStorage.setItem('config_policy', config.policy)

}, [config])---

```

## 🛠️ 개발 가이드

---

### 컴포넌트 추가

## 🔒 인증 (구현 준비중)

```typescript

- `contexts/AuthContext.tsx` - 인증 상태 관리// 1. src/components/MyComponent.tsx 작성

- `components/ProtectedRoute.tsx` - 라우트 보호function MyComponent() {

  return <div>...</div>;

---}

export default MyComponent;

**Last Updated**: 2025-10-21

// 2. ProtectReveal.tsx에서 사용
import MyComponent from '../components/MyComponent';

export function ProtectReveal() {
  return <MyComponent />;
}
```

### API 호출

```typescript
// GET 요청
const response = await api.get('/api/crdp/health');

// POST 요청
const response = await api.post('/api/crdp/protect', {
  data: '1234567890123'
});

// 에러 처리
try {
  const response = await api.post('/api/crdp/protect', payload);
} catch (error) {
  const axiosError = error as AxiosError<{ detail?: string }>;
  const status = axiosError.response?.status ?? 500;
  const message = axiosError.response?.data?.detail ?? 'Unknown error';
}
```

### 상태 관리

현재는 React의 `useState` 사용. 복잡도 증가 시 Zustand/Recoil 고려.

```typescript
const [config, setConfig] = useState<Config>({
  host: '192.168.0.231',
  port: '32082',
  policy: 'P03'
});

const handleConfigChange = (key: keyof Config, value: string) => {
  setConfig(c => ({ ...c, [key]: value }));
};
```

---

## 🐳 Docker

### 이미지 빌드

```bash
# 프로젝트 루트에서 실행
TAG=$(date +%Y%m%d-%H%M%S)
docker build -t 192.168.0.231:5001/frontend:$TAG -f frontend/Dockerfile frontend
docker push 192.168.0.231:5001/frontend:$TAG
```

### Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM node:22-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 로컬 실행

```bash
docker run -it --rm \
  -p 80:80 \
  192.168.0.231:5001/frontend:latest
```

---

## 📁 Nginx 설정 (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api/ {
        proxy_pass http://backend-service:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🎨 UI/UX 특징

### 레이아웃
- **헤더**: 브랜드 로고, 제목, 태그
- **설정 섹션**: CRDP IP, Port, Policy 입력
- **메인 그리드**: 2열 레이아웃
  - 좌측: Protect/Reveal (단일)
  - 우측: Bulk Protect/Bulk Reveal (대량)
- **진행 로그**: 백엔드↔CRDP 통신 상세 정보

### 색상 스킴
- **Primary**: Blue (#0066cc)
- **Success**: Green (#00aa00)
- **Danger**: Red (#ff4444)
- **Warning**: Orange (#ffaa00)

### 인터랙션
- 리셋 버튼: 모든 입력/결과 초기화
- 복사 버튼: 결과를 클립보드에 복사
- 자동 입력 채우기: Protect → Reveal, Bulk Protect → Bulk Reveal
- 로딩 상태: 버튼 비활성화, "처리 중..." 텍스트

---

## 🧪 테스트

### Lint 실행

```bash
npm run lint
```

### TypeScript 타입 체크

```bash
npm run check
```

### 빌드 검증

```bash
npm run build
```

---

## 📚 의존성

### 주요 라이브러리

```json
{
  "react": "^19.0.0-rc",
  "react-dom": "^19.0.0-rc",
  "react-router-dom": "^6.28.0",
  "axios": "^1.7.8",
  "typescript": "^5.2.2"
}
```

### 개발 의존성

```json
{
  "vite": "^7.1.10",
  "@vitejs/plugin-react": "^4.3.4",
  "eslint": "^9.15.0",
  "@eslint/js": "^9.15.0",
  "typescript-eslint": "^8.6.0"
}
```

---

## 🔍 디버깅

### 콘솔 로깅

```typescript
console.log('Config:', config);
console.log('API Response:', response.data);
console.log('Debug info:', response.data?.debug);
```

### 네트워크 요청 확인

브라우저 DevTools → Network 탭에서 API 요청 확인

### React DevTools

Chrome 확장프로그램 설치하여 컴포넌트 상태 확인

---

## 🚀 성능 최적화

### 번들 크기 분석

```bash
npm install -D rollup-plugin-visualizer
# vite.config.ts에 플러그인 추가
```

### 지연 로딩 (Lazy Loading)

```typescript
import { lazy, Suspense } from 'react';

const ProtectReveal = lazy(() => import('./pages/ProtectReveal'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectReveal />
    </Suspense>
  );
}
```

### 이미지 최적화

WebP 포맷 사용, 크기 제한 설정

---

## 🌐 브라우저 호환성

- Chrome/Edge: 최신 2개 버전
- Firefox: 최신 2개 버전
- Safari: 최신 2개 버전
- IE 11: 미지원

---

## 🔄 배포 체크리스트

- [ ] 의존성 설치 (`npm install`)
- [ ] Lint 실행 (`npm run lint`)
- [ ] 타입 체크 (`npm run check`)
- [ ] 프로덕션 빌드 (`npm run build`)
- [ ] 빌드 결과 검증 (dist/ 폴더 확인)
- [ ] Docker 이미지 빌드 및 레지스트리 푸시
- [ ] Helm values 파일 업데이트
- [ ] Helm 배포 실행

---

## 🎯 다음 단계

- [ ] 상태 관리 라이브러리 도입 (Zustand/Recoil)
- [ ] 토스트 알림 추가
- [ ] 다크 모드 지원
- [ ] i18n (국제화) 지원
- [ ] E2E 테스트 추가 (Cypress/Playwright)
- [ ] 성능 모니터링 (Web Vitals)
- [ ] SEO 최적화

---

**최종 업데이트**: 2025-10-21
