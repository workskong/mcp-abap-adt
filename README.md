# mcp-abap-adt

**SAP ABAP ADT용 MCP 서버** - ADT(ABAP Development Tools) 서비스를 통해 SAP ABAP 메타데이터, 소스 코드, 진단 정보를 통합적으로 제공하는 경량 Model Context Protocol(MCP) 어댑터입니다.

[![Version](https://img.shields.io/badge/version-1.3.3-blue)](https://github.com/workskong/mcp-abap-adt)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 기능

- 🔍 **ABAP 객체 검색** - 클래스, 프로그램, 인터페이스 등 다양한 객체를 검색합니다.
- 📖 **소스 코드 조회** - ABAP 클래스, 프로그램, 함수 모듈, include를 확인합니다.
- 🗂️ **DDIC 메타데이터** - 테이블 구조, CDS 뷰, 데이터 요소, 도메인을 조회합니다.
- 📊 **데이터 미리보기** - DDIC 엔터티의 실제 데이터를 미리 봅니다.
- 🔧 **런타임 진단** - ABAP trace와 runtime dump 분석에 접근합니다.
- 🚀 **이중 모드 지원** - stdio(MCP 표준)와 HTTP/SSE를 모두 지원합니다.
- 🐳 **Docker 지원** - 배포용 컨테이너 이미지를 제공합니다.
- 🔐 **유연한 인증** - Basic Auth, 헤더 기반 인증, 환경 변수 인증을 지원합니다.

## 🏃 빠른 시작

### 사전 요구 사항
- **Node.js** ≥ 18 (운영 환경에는 Node.js 22 LTS 권장)
- **npm** (Node.js에 포함)
- **TypeScript** (devDependencies로 설치됨)
- **ADT 서비스가 활성화된 SAP 시스템**

### 🚀 설치 및 설정

```powershell
# 저장소 복제
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt

# 의존성 설치
npm ci

# TypeScript 빌드
npm run build

# 환경 템플릿 복사(선택 사항)
cp .env.example .env
```

### 서버 실행

#### 📡 MCP 모드(stdio) - 기본값
```powershell
npm start
```
이 모드는 MCP 표준 방식으로 stdio를 통해 서버를 실행하며, MCP 클라이언트와 inspector에 적합합니다.

#### 🌐 HTTP/SSE 모드(원격)
```powershell
# 필요한 환경 변수 설정
$env:PORT = '6969'

# SSE 지원이 포함된 HTTP 서버 시작
npm run start-remote
```
원격 모드는 웹 기반 클라이언트를 위해 HTTP 엔드포인트와 Server-Sent Events를 제공합니다.

#### 🔍 개발 모드
```powershell
npm run dev
```
디버깅과 개발을 위해 MCP inspector와 함께 실행됩니다.

---

## 🌐 원격 HTTP 엔드포인트

HTTP/SSE 모드(`--remote`)로 실행하면 다음 엔드포인트를 사용할 수 있습니다.

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| 🟢 GET    | `/`      | 서버 상태 및 헬스 정보 | `application/json` |
| 📋 GET    | `/tools` | 사용 가능한 모든 도구와 스키마 목록 | `application/json` |
| 🔧 POST   | `/call`  | 이름으로 도구 실행 | `application/json` |
| 📡 GET    | `/events`| 실시간 업데이트용 Server-Sent Events 스트림 | `text/event-stream` |
| 🧪 POST   | `/emit`  | 테스트용 SSE 이벤트 전송(개발 전용) | `application/json` |
| 🔌 POST   | `/`      | 대체 MCP JSON-RPC 엔드포인트 | `application/json` |

### 🔐 인증 옵션

서버는 여러 인증 방식을 지원합니다.

1. **Basic Authentication** - 표준 HTTP Basic Auth 헤더 사용
2. **사용자 정의 헤더** - 일반 인증에 `X-Username`/`X-Password` 사용
3. **SAP 헤더** - SAP 전용 인증에 `X-SAP_USERNAME`/`X-SAP_PASSWORD` 사용
4. **환경 변수** - stdio 모드에서 환경 변수로 자격 증명 설정

***

## 🔌 MCP 클라이언트 설정 예시

아래 예시는 MCP 클라이언트(VS Code, Eclipse)를 위한 설정 예시입니다. 실제 자격 증명은 그대로 사용하고, 예시에서는 플레이스홀더를 사용합니다.

### VS Code

#### 원격(HTTP/SSE)
```json
{
  "inputs": [
    { "id": "SAP_USERNAME", "type": "promptString", "description": "SAP Username", "password": false },
    { "id": "SAP_PASSWORD", "type": "promptString", "description": "SAP Password", "password": true },
    { "id": "SAP_CLIENT", "type": "promptString", "description": "SAP Client", "password": false },
    { "id": "SAP_LANGUAGE", "type": "promptString", "description": "SAP Language", "password": false },
    { "id": "SAP_URL", "type": "promptString", "description": "SAP URL", "password": false }
  ],
  "servers": {
    "mcp-abap-adt": {
      "type": "sse",
      "url": "http://localhost:6969",
      "headers": {
        "X-SAP_USERNAME": "${input:SAP_USERNAME}",
        "X-SAP_PASSWORD": "${input:SAP_PASSWORD}",
        "X-SAP_CLIENT": "${input:SAP_CLIENT}",
        "X-SAP_LANGUAGE": "${input:SAP_LANGUAGE}",
        "X-SAP_URL": "${input:SAP_URL}"
      }
    }
  }
}
```

#### 로컬(stdio)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "type": "stdio",
      "command": "node",
      "cwd": "C:/Users/{...}/Documents/mcp-abap-adt",
      "args": [
        "C:/Users/{...}/Documents/mcp-abap-adt/dist/index.js"
      ],
      "env": {
        "SAP_USERNAME": "DEV00",
        "SAP_PASSWORD": "XXXX",
        "SAP_CLIENT": "001",
        "SAP_LANGUAGE": "EN",
        "SAP_URL": "http://your-sap-server:50000"
      }
    }
  }
}
```

이 예시들은 HTTP 기반 SSE 원격 연결 또는 서버를 자식 프로세스로 실행해 stdio로 통신하는 로컬 연결을 보여줍니다. 빌드 후 `dist/index.js`가 존재해야 합니다.

### Eclipse

#### 원격(HTTP/SSE)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "url": "http://localhost:6969",
      "requestInit": {
        "headers": {
          "X-SAP_USERNAME": "DEV00",
          "X-SAP_PASSWORD": "XXXX",
          "X-SAP_CLIENT": "001",
          "X-SAP_LANGUAGE": "EN",
          "X-SAP_URL": "http://your-sap-server:50000"
        }
      }
    }
  }
}
```

#### 로컬(stdio)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "type": "stdio",
      "command": "node",
      "cwd": "C:/Users/{...}/Documents/mcp-abap-adt",
      "args": [
        "C:/Users/{...}/Documents/mcp-abap-adt/dist/index.js"
      ],
      "env": {
        "SAP_USERNAME": "DEV00",
        "SAP_PASSWORD": "XXXX",
        "SAP_CLIENT": "001",
        "SAP_LANGUAGE": "EN",
        "SAP_URL": "http://your-sap-server:50000"
      }
    }
  }
}
```
Eclipse는 원격 HTTP 래퍼에 연결하거나, 서버를 직접 실행해 stdio로 통신할 수 있습니다.

참고:
- 원격 모드에서는 클라이언트가 연결하기 전에 `--remote`와 `PORT`(예: 6969)를 지정해 서버를 먼저 실행해야 합니다.
- stdio 모드에서는 TypeScript 빌드 결과물인 `dist/index.js`가 생성되어 있어야 하며, Node.js 18+가 PATH에 있어야 합니다.

***

## 🐳 Docker 배포

### 🏗️ 이미지 빌드
```bash
docker build -t mcp-abap-adt:latest .
```

### 🚀 컨테이너 실행

**기본 HTTP/SSE 모드:**
```bash
docker run --rm \
  -e PORT=6969 \
  -e TLS_REJECT_UNAUTHORIZED=0 \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

**SAP 연결 포함:**
```bash
docker run --rm \
  -e PORT=6969 \
  -e SAP_URL="http://your-sap-server:50000" \
  -e TLS_REJECT_UNAUTHORIZED=0 \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

**환경 파일 사용:**
```bash
docker run --rm \
  --env-file .env \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

### 🔍 컨테이너 헬스 체크
이 Docker 이미지는 서버 상태를 감시하는 자동 헬스 체크를 포함합니다. 서버가 연결을 받을 준비가 되면 컨테이너는 healthy 상태가 됩니다.

---

## ⚙️ 환경 변수

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes (remote mode) | `6969` | HTTP 서버 포트 |
| `NODE_ENV` | No | `production` | 실행 환경(`production`, `development`) |
| `TLS_REJECT_UNAUTHORIZED` | No | `0` | TLS 인증서 검증(0=비활성화, 1=활성화) |
| `SAP_URL` | Yes | - | ADT 서비스가 활성화된 SAP ABAP 서버 URL |
| `SAP_USERNAME` | No | - | SAP 사용자명(함수 파라미터가 없을 때 대체값) |
| `SAP_PASSWORD` | No | - | SAP 비밀번호(함수 파라미터가 없을 때 대체값) |
| `SAP_CLIENT` | No | - | SAP 클라이언트 번호(함수 파라미터가 없을 때 대체값) |
| `SAP_LANGUAGE` | No | `EN` | 기본 SAP 언어(함수 파라미터가 없을 때 대체값) |

### 🔧 환경 변수 설정

**Windows PowerShell:**
```powershell
$env:PORT = "6969"
$env:SAP_URL = "https://your-sap-server.company.com:8000"
$env:SAP_USERNAME = "your_username"
$env:SAP_PASSWORD = "your_password"
$env:SAP_CLIENT = "100"
$env:SAP_LANGUAGE = "EN"
$env:TLS_REJECT_UNAUTHORIZED = "0"
```

**Linux/macOS:**
```bash
export PORT=6969
export SAP_URL="https://your-sap-server.company.com:8000"
export SAP_USERNAME="your_username"
export SAP_PASSWORD="your_password"
export SAP_CLIENT="100"
export SAP_LANGUAGE="EN"
export TLS_REJECT_UNAUTHORIZED=0
```

**.env 파일 사용:**
```bash
cp .env.example .env
# .env 파일에 SAP 연결 정보를 입력
```

### 🔐 인증 우선순위

서버는 다음 우선순위로 여러 인증 방법을 지원합니다.

1. **함수 파라미터** - 가장 높은 우선순위(각 도구 호출에 직접 전달)
2. **환경 변수** - 함수 파라미터가 비어 있을 때 대체
3. **헤더** - 원격 HTTP 모드에서 요청별 인증에 사용

SAP 인증 파라미터(`_sapUsername`, `_sapPassword`, `_sapClient`, `_sapLanguage`)가 함수 호출에 전달되지 않으면, 서버는 자동으로 환경 변수 값을 사용합니다. 이를 통해 자격 증명을 한 번만 환경에 설정해도 다양한 배포 방식에 대응할 수 있습니다.

---

## 🛠️ 제공 도구

이 서버는 SAP ABAP 시스템에 대한 포괄적인 접근을 위해 22개의 도구를 제공합니다. 각 도구의 상세 입력 스키마는 `/tools` 엔드포인트에서 확인할 수 있습니다.

### 🔍 검색 및 탐색
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `SearchObject` | 시스템 전반에서 ABAP 객체 검색 | `query`, `maxResults` |
| `API_Releases` | ADT 객체의 API 릴리스 정보 조회 | `query` |

### 📖 소스 코드 접근  
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `Get_Class` | ABAP 클래스 소스 코드 조회 | `class_name` |
| `Get_Program` | ABAP 프로그램 소스 코드 조회 | `program_name` |
| `Get_Function` | 함수 모듈 소스 조회 | `function_name`, `function_group` |
| `Get_FunctionGroup` | 함수 그룹 소스 조회 | `function_group` |
| `Get_Include` | ABAP include 소스 조회 | `include_name` |
| `Get_Interface` | ABAP 인터페이스 소스 조회 | `interface_name` |
| `Get_Transaction` | ABAP 트랜잭션 정보 조회 | `transaction_name` |

### 🗂️ DDIC 메타데이터
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `GetDDIC_Table` | 데이터베이스 테이블 정의 조회 | `object_name` |
| `GetDDIC_CDS` | CDS 뷰 정의 조회 | `object_name` |
| `GetDDIC_Structure` | DDIC 구조 정의 조회 | `object_name` |
| `GetDDIC_DataElements` | 데이터 요소 정의 조회 | `object_name` |
| `GetDDIC_Domains` | 도메인 정의 조회 | `object_name` |
| `GetDDIC_TypeInfo` | DDIC 타입 정보 조회 | `object_name` |

### 📊 데이터 및 진단
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `DataPreview` | DDIC 엔터티의 실제 데이터 미리보기 | `ddicEntityName`, `rowNumber` |
| `Get_Package` | 패키지 정보 및 내용 조회 | `package_name` |
| `Get_MessageClass` | 메시지 클래스 정보 조회 | `MessageClass` |

### 🔧 런타임 분석
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `GetRuntimeDumps` | ABAP runtime dump 목록 조회 | `start_date`, `end_date`, `maxResults` |
| `GetRuntimeDumpDetails` | runtime dump 상세 정보 조회 | `id` |
| `Get_ABAPTraces` | ABAP 성능 trace 데이터 조회 | `user`, `maxResults` |
| `Get_ABAPTracesDetails` | ABAP trace 상세 정보 조회 | `id`, `type` |

> 💡 **팁**: `GET /tools`를 사용하면 각 도구의 JSON 스키마가 포함된 전체 목록을 확인할 수 있습니다.

---

## 📖 API 예시

### 🔧 도구 실행 예시

**PowerShell(Windows):**
```powershell
# ABAP 객체 검색
Invoke-RestMethod -Uri http://localhost:6969/call -Method POST `
  -Headers @{ 
    "X-SAP_USERNAME"="DEV00"
    "X-SAP_PASSWORD"="your-password"
    "X-SAP_URL"="http://your-sap-server:50000"
    "Content-Type"="application/json"
  } `
  -Body (@{ 
    tool="SearchObject"
    arguments=@{ query="SBOOK"; maxResults=10 } 
  } | ConvertTo-Json -Compress)

# ABAP 클래스 소스 조회
Invoke-RestMethod -Uri http://localhost:6969/call -Method POST `
  -Headers @{ 
    "X-SAP_USERNAME"="DEV00"
    "X-SAP_PASSWORD"="your-password"
    "X-SAP_URL"="http://your-sap-server:50000"
  } `
  -Body (@{ 
    tool="Get_Class"
    arguments=@{ class_name="CL_ABAP_CHAR_UTILITIES" } 
  } | ConvertTo-Json)
```

**curl(Linux/macOS):**
```bash
# 테이블 구조 조회
curl -X POST http://localhost:6969/call \
  -H "X-SAP_USERNAME: DEV00" \
  -H "X-SAP_PASSWORD: your-password" \
  -H "X-SAP_URL: http://your-sap-server:50000" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "GetDDIC_Table",
    "arguments": {
      "object_name": "SBOOK"
    }
  }'

# 테이블 데이터 미리보기
curl -X POST http://localhost:6969/call \
  -H "X-SAP_USERNAME: DEV00" \
  -H "X-SAP_PASSWORD: your-password" \
  -H "X-SAP_URL: http://your-sap-server:50000" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "DataPreview",
    "arguments": {
      "ddicEntityName": "SBOOK",
      "rowNumber": 50
    }
  }'
```

**JavaScript/Node.js:**
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:6969',
  headers: {
    'X-SAP_USERNAME': 'DEV00',
    'X-SAP_PASSWORD': 'your-password',
    'X-SAP_URL': 'http://your-sap-server:50000',
    'Content-Type': 'application/json'
  }
});

async function getProgram(programName) {
  const response = await client.post('/call', {
    tool: 'Get_Program',
    arguments: {
      program_name: programName
    }
  });
  return response.data;
}

// 사용 예시
getProgram('YSAPBC_DATA_GENERATOR')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

---

## 👩‍💻 개발 및 테스트

### 🔧 개발 설정
```bash
# 의존성 설치
npm ci

# TypeScript 빌드
npm run build

# 테스트 실행
npm test

# 개발용 MCP inspector로 시작
npm run dev

# 개발 중 watch 모드 실행
npm run build -- --watch
```

### 🧪 테스트 도구
```bash
# 전체 테스트 실행
npm test

# watch 모드로 테스트 실행
npm run test -- --watch

# 커버리지 포함 테스트 실행
npm run test -- --coverage
```

### 🔨 새 도구 추가하기

새로운 ABAP 기능을 추가하려면 다음 단계를 따르세요.

1. **핸들러 생성** - `src/handlers/`에 새 핸들러 파일을 추가합니다.
   ```typescript
   // src/handlers/handle_MyNewTool.ts
   export async function handleMyNewTool(args: any, config: SapConfig) {
     // 구현 내용
     return { result: "success" };
   }
   ```

2. **핸들러 내보내기** - `src/lib/handlerExports.ts`에 추가합니다.
   ```typescript
   export * as handle_MyNewTool from '../handlers/handle_MyNewTool';
   ```

3. **도구 정의** - `src/lib/toolDefinitions.ts`에 정의를 추가합니다.
   ```typescript
   {
     name: 'MyNewTool',
     description: '이 도구가 수행하는 작업 설명',
     inputSchema: {
       type: 'object',
       properties: {
         param1: { type: 'string', description: '파라미터 설명' }
       },
       required: ['param1']
     },
     handler: handlers.handle_MyNewTool.handleMyNewTool
   }
   ```

4. **빌드 및 테스트**
   ```bash
   npm run build
   npm test
   ```

### 🏗️ 프로젝트 구조
```
mcp-abap-adt/
├── src/
│   ├── handlers/          # 도구 구현 핸들러
│   └── lib/
│       ├── config.ts      # 설정 관리
│       ├── toolDefinitions.ts  # 도구 스키마 및 라우팅
│       ├── handlerExports.ts   # 핸들러 export
│       ├── remoteServer.ts     # HTTP/SSE 서버
│       ├── utils.ts            # 유틸리티 함수
│       └── mcpErrorHandler.ts  # 에러 처리
├── dist/                  # 컴파일된 TypeScript 출력물
├── index.ts               # 메인 서버 진입점
├── Dockerfile             # 컨테이너 설정
└── package.json           # 의존성과 스크립트
```

---

## ❗ 문제 해결

### 🔧 자주 발생하는 문제와 해결 방법

**🚫 PORT 필요 오류**
```
Error: PORT environment variable is required for remote mode
```
**해결 방법:**
```powershell
# Windows PowerShell
$env:PORT = "6969"

# Linux/macOS
export PORT=6969
```

**🌐 SAP URL 누락**
```
Error: SAP_URL is required
```
**해결 방법:** 환경 변수 또는 요청 헤더를 통해 SAP URL을 제공하세요.
```bash
# 환경 변수
export SAP_URL="http://your-sap-server:50000"

# 또는 요청 시 X-SAP_URL 헤더 사용
curl -H "X-SAP_URL: http://your-sap-server:50000" ...
```

**🔐 인증 실패**
```
Error: 401 Unauthorized
```
**해결 방법:**
- Basic Auth 사용: `Authorization: Basic <base64(username:password)>`
- 사용자 정의 헤더 사용: `X-SAP_USERNAME`, `X-SAP_PASSWORD`
- SAP 사용자 권한이 ADT 접근을 허용하는지 확인

**🏥 컨테이너 헬스 체크 문제**
```
Container unhealthy
```
**해결 방법:**
- `PORT` 환경 변수가 설정되어 있는지 확인
- 컨테이너 로그 확인: `docker logs <container-id>`
- SAP 시스템 연결 상태 확인

**📦 빌드/런타임 오류**
```
Module not found or TypeScript compilation errors
```
**해결 방법:**
```bash
# 정리 후 재빌드
rm -rf dist/ node_modules/
npm ci
npm run build

# Node.js 버전 확인(≥18 필요)
node --version
```

**🔗 연결 타임아웃**
```
Error: connect ETIMEDOUT
```
**해결 방법:**
- SAP 시스템에 접근 가능한지 확인
- 네트워크 연결과 방화벽 설정 확인
- SAP 시스템에서 ADT 서비스가 활성화되어 있는지 확인
- 자체 서명 인증서를 사용하는 경우 `TLS_REJECT_UNAUTHORIZED=0`으로 설정

### 📋 디버그 체크리스트

1. ✅ Node.js ≥ 18 설치됨
2. ✅ TypeScript가 컴파일됨(`dist/` 폴더 존재)
3. ✅ 환경 변수가 올바르게 설정됨
4. ✅ SAP 시스템 접근 가능 및 ADT 활성화됨
5. ✅ 인증 정보가 유효함
6. ✅ 네트워크 연결 정상(프록시/방화벽 차단 없음)

### 🆘 도움 받기

아래 방법으로도 해결되지 않으면 다음을 확인하세요.

1. **로그 확인** - `NODE_ENV=development`로 디버그 로깅 활성화
2. **설정 재검토** - 모든 환경 변수와 헤더 값 검증
3. **SAP 연결 테스트** - ADT 서비스가 직접 응답하는지 확인
4. **이슈 등록** - 로그와 설정 정보를 포함해 GitHub 이슈를 생성

---

## 📜 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

## 🤝 기여하기

기여를 환영합니다. Pull Request를 자유롭게 제출해 주세요. 큰 변경의 경우, 먼저 이슈를 열어 변경 내용을 논의해 주세요.

### 개발 워크플로
1. 저장소를 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 작성 및 테스트 추가
4. 테스트 실행 (`npm test`)
5. 커밋 생성 (`git commit -m 'Add amazing feature'`)
6. 브랜치 푸시 (`git push origin feature/amazing-feature`)
7. Pull Request 열기

## 🔗 링크

- **Repository**: [https://github.com/workskong/mcp-abap-adt](https://github.com/workskong/mcp-abap-adt)
- **Issues**: [https://github.com/workskong/mcp-abap-adt/issues](https://github.com/workskong/mcp-abap-adt/issues)
- **NPM Package**: [@orchestraight.co/mcp-abap-adt](https://www.npmjs.com/package/@orchestraight.co/mcp-abap-adt)
- **Model Context Protocol**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

## 📊 버전 기록

- **v1.3.3** - 최신 릴리스
- Node.js 22 기반 Docker 지원 강화
- 에러 처리 및 진단 개선
- 포괄적인 도구 카탈로그 추가

---

**SAP ABAP 커뮤니티를 위해 ❤️로 만들었습니다**
