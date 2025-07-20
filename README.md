# MCP ABAP ADT Server

[![smithery badge](https://smithery.ai/badge/@orchestraight.co/mcp-abap-adt)](https://smithery.ai/server/@orchestraight.co/mcp-abap-adt)

MCP ABAP ADT Server는 ABAP Development Tools(ADT)를 위한 Model Context Protocol(MCP) 서버입니다.  
SAP ABAP 시스템과 연동하여 소스코드, 데이터 딕셔너리(DDIC), 오브젝트 검색 등 다양한 개발 지원 기능을 제공합니다.

---

## 🚀 주요 기능

### 📋 DDIC(Data Dictionary) 조회
- **GetDDICStructure**: 구조(Structure) 정의 조회
- **GetDDICTypeInfo**: 타입 정보 조회
- **GetDDICTable**: 테이블 정의 조회
- **GetDDICCDS**: CDS 뷰 정의 조회
- **GetDDICDataElement**: 데이터 엘리먼트 정의 조회
- **GetDDICDomain**: 도메인 정의 조회

### 💻 ABAP 개발 오브젝트 조회
- **GetProgram**: ABAP 프로그램 소스코드 조회
- **GetClass**: ABAP 클래스 소스코드 조회
- **GetFunction**: 펑션 모듈 소스코드 조회
- **GetFunctionGroup**: 펑션 그룹 소스코드 조회
- **GetInterface**: 인터페이스 소스코드 조회
- **GetInclude**: 인클루드 소스코드 조회

### 🔍 검색 및 분석
- **SearchObject**: ABAP 오브젝트 검색
- **GetWhereUsed**: 오브젝트 참조 및 사용처 조회
- **GetPackage**: 패키지 상세 정보 조회
- **GetTransaction**: 트랜잭션 상세 정보 조회

---

## 📦 설치 및 설정

### 1. 사전 요구사항
- **Node.js (LTS 버전)** 및 **npm**
- **SAP ABAP 시스템** 접근 권한
  - ADT 서비스 활성화(`/sap/bc/adt`)
  - 유효한 SAP 사용자 계정 및 클라이언트 번호

### 2. 설치
```bash
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt
npm install
npm run build
```

### 3. 환경 설정
프로젝트 루트에 `.env` 파일을 생성하고 아래와 같이 SAP 시스템 정보를 입력하세요.
```env
SAP_URL=https://your-sap-system.com:8000
SAP_USERNAME=your_username
SAP_PASSWORD=your_password
SAP_CLIENT=100
```

---

## 🛠️ 사용법

- **개발 모드 실행**
  ```bash
  npm run dev
  ```
- **프로덕션 모드 실행**
  ```bash
  npm run start
  ```
- **테스트 실행**
  ```bash
  npm test
  ```

---

## 📚 API 참조

### DDIC 조회 API

| 툴명               | 설명                  | 파라미터                       | 예시                                      |
|--------------------|----------------------|--------------------------------|--------------------------------------------|
| GetDDICStructure   | 스트럭쳐 정의 조회    | `object_name` (필수)           | `{"object_name": "ZMY_STRUCTURE"}`         |
| GetDDICTypeInfo    | 타입 정보 조회       | `object_name` (필수)           | `{"object_name": "ZMY_TYPE"}`              |
| GetDDICTable       | 테이블 정의 조회     | `object_name` (필수)           | `{"object_name": "ZMY_TABLE"}`             |
| GetDDICCDS         | CDS 뷰 정의 조회     | `object_name` (필수)           | `{"object_name": "ZMY_CDS_VIEW"}`          |
| GetDDICDataElement | 데이터 엘리먼트 조회 | `object_name` (필수)           | `{"object_name": "ZMY_DATA_ELEMENT"}`      |
| GetDDICDomain      | 도메인 정의 조회     | `object_name` (필수)           | `{"object_name": "ZMY_DOMAIN"}`            |

### ABAP 개발 오브젝트 조회 API

| 툴명            | 설명                     | 파라미터                                           | 예시                                                          |
|-----------------|--------------------------|----------------------------------------------------|---------------------------------------------------------------|
| GetProgram      | 프로그램 소스코드 조회   | `program_name` (필수)                              | `{"program_name": "ZMY_PROGRAM"}`                             |
| GetClass        | 클래스 소스코드 조회     | `class_name` (필수)                                | `{"class_name": "ZCL_MY_CLASS"}`                              |
| GetFunction     | 펑션 모듈 소스코드 조회  | `function_name` (필수), `function_group` (필수)    | `{"function_name": "ZMY_FUNCTION", "function_group": "ZFG"}`  |
| GetFunctionGroup| 펑션 그룹 소스코드 조회  | `function_group` (필수)                            | `{"function_group": "ZFG"}`                                   |
| GetInterface    | 인터페이스 소스코드 조회 | `interface_name` (필수)                            | `{"interface_name": "ZIF_MY_INTERFACE"}`                      |
| GetInclude      | 인클루드 소스코드 조회   | `include_name` (필수)                              | `{"include_name": "ZMY_INCLUDE"}`                             |

### 검색 및 분석 API

| 툴명           | 설명                    | 파라미터                                                           | 예시                                                                           |
|----------------|-------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------|
| SearchObject   | 오브젝트 검색           | `query` (필수), `maxResults` (선택, 기본값: 100)                   | `{"query": "ZMY*", "maxResults": 50}`                                         |
| GetWhereUsed   | 참조 및 사용처 조회     | `object_name` (필수), `object_type` (선택), `max_results` (선택)   | `{"object_name": "ZCL_MY_CLASS", "object_type": "CLASS", "max_results": 50}`   |
| GetPackage     | 패키지 상세 정보 조회   | `package_name` (필수)                                              | `{"package_name": "ZMY_PACKAGE"}`                                              |
| GetTransaction | 트랜잭션 상세 정보 조회 | `transaction_name` (필수)                                          | `{"transaction_name": "ZMY_TRANSACTION"}`                                      |

#### GetWhereUsed 지원 오브젝트 타입

| 카테고리      | 지원 타입                                                                                           |
|---------------|----------------------------------------------------------------------------------------------------|
| 개발 오브젝트 | `CLASS`, `INTERFACE`, `PROGRAM`, `FUNCTION`, `REPORT`, `INCLUDE`                                   |
| DDIC 오브젝트 | `TABLE`, `STRUCTURE`, `TYPE`, `DOMAIN`, `DATA_ELEMENT`, `VIEW`, `CDS_VIEW`                         |
| 기타 오브젝트 | `SEARCH_HELP`, `LOCK_OBJECT`, `TRANSFORMATION`, `ENHANCEMENT`, `PACKAGE`, `TRANSPORT`              |
| 코드 요소     | `FORM`, `METHOD`, `ATTRIBUTE`, `CONSTANT`, `VARIABLE`, `PARAMETER`, `SELECT_OPTION`, `FIELD_SYMBOL`, `DATA` |
| 고급 오브젝트 | `AMDP`, `DDIC_OBJECT`, `AUTHORIZATION_OBJECT`, `NUMBER_RANGE`                                      |

---

## 🔧 MCP 클라이언트 연동

### Eclipse GitHub Copilot Extension 설정 (MCP 연동)

1. **GitHub Copilot Extension 설치**  
   - Eclipse Marketplace 또는 플러그인 관리에서 "GitHub Copilot" 설치

2. **MCP 서버 설정 파일 편집**  
   - 워크스페이스 또는 사용자 홈 디렉터리에 `copilot_mcp_settings.json`(혹은 비슷한 이름) 파일 생성/편집

3. **서버 설정 예시**
   ```json
   {
     "mcpServers": {
       "mcp-abap-adt": {
         "command": "node",
         "args": ["C:/path/to/mcp-abap-adt/dist/index.js"],
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```
   > 실제 파일명·위치는 Copilot 플러그인 공식 문서를 참고하세요.

4. **플러그인 재시작/설정 반영**  
   - 설정 파일 변경 후 Eclipse를 재시작하거나, Copilot Extension을 재로드하여 반영

#### 사용 예시 (Eclipse 내 MCP 명령)
```bash
@tool GetProgram program_name=ZMY_PROGRAM
@tool GetClass class_name=ZCL_MY_CLASS
@tool GetDDICTable object_name=ZMY_TABLE
@tool SearchObject query=ZMY* maxResults=20
@tool GetWhereUsed object_name=ZCL_MY_CLASS object_type=CLASS
```

> MCP 서버의 경로(`"args"`)는 실제 MCP 서버 빌드 위치에 맞게 수정하세요.  
> 사용법, 설정 위치, 파일명 등은 플러그인 배포 문서의 최신 정보를 참고하세요.

---

## 🐛 문제 해결

| 문제                          | 해결 방법                                                                                   |
|-------------------------------|--------------------------------------------------------------------------------------------|
| **빌드 오류**                 | `npm install` 후 `npm run build` 실행                                                      |
| **SAP 연결 오류**             | `.env` 파일 인증 정보, SAP 시스템 접근 가능 여부, ADT 서비스 활성화 상태 확인               |
| **MCP 클라이언트 연결 오류**  | 서버 실행 상태, 경로 확인, Eclipse 또는 Copilot Extension 재시작                           |

### 디버깅
- 개발 모드에서 MCP Inspector를 사용하여 디버깅:
  ```bash
  npm run dev
  ```
- 브라우저에서 `http://localhost:5173`로 접속하여 API 테스트 가능

---

## 📄 라이선스

MIT License

---

**ABAP 개발을 더욱 효율적으로 만들어보세요!** 🚀