# MCP ABAP ADT Server

[![smithery badge](https://smithery.ai/badge/@orchestraight.co/mcp-abap-adt)](https://smithery.ai/server/@orchestraight.co/mcp-abap-adt)

**MCP ABAP ADT Server**는 ABAP Development Tools(ADT)를 위한 Model Context Protocol(MCP) 서버입니다.  
SAP ABAP 시스템과 연동하여 소스코드, 데이터 딕셔너리(DDIC), 오브젝트 검색 등 다양한 개발 지원 기능을 제공합니다.

---

## ✨ 핵심 기능

### 📊 데이터 딕셔너리(DDIC) 조회
- **구조체 & 타입**: Structure, Type 정의 및 상세 정보 조회
- **테이블 관리**: 테이블 구조, 필드, 인덱스 정보 추출
- **CDS 뷰**: 최신 CDS 뷰 정의 및 종속성 분석
- **데이터 요소**: Data Element, Domain 세부 정보 제공

### 💻 ABAP 개발 오브젝트 관리
| 오브젝트 타입 | 지원 기능            | 활용 사례                 |
|--------------|---------------------|--------------------------|
| Program      | 소스코드 전체 조회   | 레포트, 실행 프로그램 분석 |
| Class        | 클래스 정의/구현부   | OOP, 디자인 패턴 분석     |
| Function     | 펑션 모듈 소스/인터페이스 | RFC, 재사용 로직 관리     |
| Interface    | 인터페이스 명세 조회 | 계약 기반 설계           |
| Include      | 인클루드 소스코드    | 공통 코드 관리           |

### 🔍 고급 검색 & 분석
- **스마트 오브젝트 검색**: 패턴 매칭 및 필터링 지원
- **Where-Used 분석**: 오브젝트 참조 관계 추적
- **패키지 관리**: 패키지 구조 및 내용 분석
- **트랜잭션 정보**: T-Code 상세 정보 제공

---

## 🚀 빠른 시작

### 요구사항
- Node.js 18+ (LTS 권장)
- SAP ABAP 시스템 접근 권한
  - ADT 서비스 활성화(`/sap/bc/adt`)
  - 유효한 사용자 계정

### 설치 프로세스
```bash
# 1. 저장소 복제
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt

# 2. 의존성 설치 및 빌드
npm install
npm run build

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 SAP 연결 정보 입력
```

### 환경 설정 예시
`.env` 파일에 SAP 시스템 정보를 구성하세요:
```env
SAP_URL=https://your-sap-system.com:8000
SAP_USERNAME=your_username
SAP_PASSWORD=your_password
SAP_CLIENT=100
```

### 실행 명령
```bash
# 개발 모드 (디버깅 지원)
npm run dev

# 프로덕션 모드
npm start

# 테스트 실행
npm test
```

---

## 📖 API 레퍼런스

### DDIC 조회 도구

| API                | 기능            | 필수 파라미터     | 사용 예시                                     |
|--------------------------|----------------------|---------------------|---------------------------------------------------|
| GetDDICStructure         | 구조체 정의 조회     | object_name         | `{"object_name": "SFLIGHT"}`                      |
| GetDDICTable             | 테이블 구조 분석     | object_name         | `{"object_name": "MARA"}`                         |
| GetDDICCDS               | CDS 뷰 정의          | object_name         | `{"object_name": "I_Product"}`                    |
| GetDDICDataElement       | 데이터 요소 정보     | object_name         | `{"object_name": "MATNR"}`                        |
| GetDDICDataElements      | 데이터 요소 상세     | object_name         | `{"object_name": "MATNR"}`                        |
| GetDDICDomain            | 도메인 상세 정보     | object_name         | `{"object_name": "CHAR10"}`                       |
| GetDDICTypeInfo          | 타입 상세 정보       | object_name         | `{"object_name": "TYPE_NAME"}`                    |


### 개발 오브젝트 도구

| API         | 기능               | 파라미터                            | 예시                                                         |
|---------------------|----------------------|------------------------------------------|-------------------------------------------------------------------|
| GetProgram          | 프로그램 소스 조회   | program_name                             | `{"program_name": "RSUSR003"}`                                   |
| GetClass            | 클래스 소스 조회     | class_name                               | `{"class_name": "CL_HTTP_CLIENT"}`                               |
| GetFunction         | 펑션 모듈 소스       | function_name, function_group            | `{"function_name": "RFC_READ_TABLE", "function_group": "SRFC"}`   |
| GetFunctionGroup    | 펑션 그룹 소스 조회  | function_group                           | `{"function_group": "SRFC"}`                                      |
| GetInclude          | 인클루드 소스 조회   | include_name                             | `{"include_name": "LZPROGRAMU01"}`                                |
| GetInterface        | 인터페이스 정의      | interface_name                           | `{"interface_name": "IF_HTTP_CLIENT"}`                            |
| APIReleases         | API Release 정보     | query                                    | `{"query": "CL_HTTP_CLIENT"}`                                      |

### 분석 및 검색 도구

| API           | 목적           | 파라미터                         | 고급 옵션/특징                  |
|---------------|----------------|-----------------------------------|---------------------------------|
| SearchObject  | 오브젝트 검색  | query, maxResults                 | 와일드카드, 정규식 지원         |
| GetWhereUsed  | 사용처 분석    | object_name, object_type          | 60+ 오브젝트 타입 지원          |
| GetPackage    | 패키지 정보    | package_name                      | 계층 구조 포함                  |
| GetTransaction| T-Code 상세    | transaction_name                  | 연결된 프로그램 정보            |

#### Where-Used 지원 오브젝트 타입

| 카테고리    | 지원 타입                                                           |
|-------------|---------------------------------------------------------------------|
| 핵심 개발   | CLASS, INTERFACE, PROGRAM, FUNCTION, INCLUDE                        |
| 데이터 관리 | TABLE, STRUCTURE, VIEW, CDS_VIEW, DOMAIN                            |
| 고급 기능   | ENHANCEMENT, AMDP, TRANSFORMATION, SEARCH_HELP                      |
| 코드 요소   | METHOD, ATTRIBUTE, FORM, VARIABLE, PARAMETER                        |

---

## 🔧 MCP 클라이언트 통합

### Claude Desktop 설정
`claude_desktop_config.json`에 서버 구성을 추가하세요:
```json
{
  "mcpServers": {
    "mcp-abap-adt": {
      "command": "node",
      "args": ["/path/to/mcp-abap-adt/dist/index.js"],
      "env": {
        "SAP_URL": "https://your-sap-system.com:8000",
        "SAP_USERNAME": "your_username",
        "SAP_PASSWORD": "your_password",
        "SAP_CLIENT": "100"
      }
    }
  }
}
```

### VS Code 연동

1. MCP Extension 설치
2. 워크스페이스 설정(`.vscode/settings.json`)에 추가:
    ```json
    {
      "mcp.servers": {
        "abap-adt": {
          "command": "node",
          "args": ["./dist/index.js"],
          "cwd": "/path/to/mcp-abap-adt"
        }
      }
    }
    ```

### Eclipse GitHub Copilot Extension 연동

1. **GitHub Copilot Extension 설치**  
   - Eclipse Marketplace 또는 플러그인 관리에서 "GitHub Copilot" 설치

2. **MCP 서버 설정 파일 편집**  
   - 워크스페이스 또는 사용자 홈 디렉터리에 `copilot_mcp_settings.json`(혹은 유사 파일) 생성/편집

3. **서버 설정 예시**
   ```json
   {
     "mcpServers": {
       "mcp-abap-adt": {
         "command": "node",
         "args": ["/path/to/mcp-abap-adt/dist/index.js"],
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```
   > 실제 파일명·위치는 Copilot 플러그인 공식 문서를 참고하세요.

4. **플러그인 재시작/설정 반영**  
   - 설정 파일 변경 후 Eclipse를 재시작하거나, Copilot Extension을 재로드하여 반영

---

### 사용 예시

```bash

# 클래스 소스코드 조회
@tool GetClass class_name=CL_HTTP_CLIENT

# 테이블 구조 분석
@tool GetDDICTable object_name=SFLIGHT

# 데이터 요소 상세 조회
@tool GetDDICDataElements object_name=MATNR

# 타입 상세 정보 조회
@tool GetDDICTypeInfo object_name=TYPE_NAME

# 펑션 그룹 소스 조회
@tool GetFunctionGroup function_group=SRFC

# 인클루드 소스 조회
@tool GetInclude include_name=LZPROGRAMU01

# API Release 정보 조회
@tool APIReleases query=CL_HTTP_CLIENT

# 오브젝트 검색 (와일드카드 지원)
@tool SearchObject query=CL_HTTP* maxResults=10

# Where-Used 분석
@tool GetWhereUsed object_name=MATNR object_type=DATA_ELEMENT
```

---

## 🛠️ 문제 해결

| 문제 상황           | 원인/해결 방법                                                    |
|---------------------|-------------------------------------------------------------------|
| 빌드 실패           | 의존성 문제: `rm -rf node_modules && npm install`                 |
| SAP 연결 오류       | 인증/네트워크: `.env` 설정 검증, 방화벽 확인                      |
| ADT 서비스 접근 불가 | 서비스 비활성화: `/sap/bc/adt` 경로 활성화 확인                  |
| MCP 클라이언트 연결 실패 | 경로/권한 문제: 절대 경로 사용, 실행 권한 확인                |

### 디버깅 지원

- **MCP Inspector 활용**  
  ```bash
  npm run dev
  ```
  브라우저에서 [http://localhost:5173](http://localhost:5173) 접속하여 실시간 디버깅

- **로깅 활성화**
  ```
  DEBUG=mcp-abap-adt:*
  LOG_LEVEL=debug
  ```

### 성능 최적화
- **캐싱**: 자주 사용하는 오브젝트 정보는 로컬 캐시 활용
- **배치 처리**: 여러 오브젝트 조회 시 병렬 처리 지원
- **필터링**: `maxResults` 파라미터로 결과 수 제한

---

## 🤝 기여하기

프로젝트 개선에 참여해 주세요!

1. **이슈 리포팅**: 버그나 개선 사항을 GitHub Issues에 등록
2. **기능 제안**: 새로운 API나 기능에 대한 제안 환영
3. **코드 기여**: Pull Request를 통한 코드 개선
4. **문서화**: README, API 문서 개선

### 개발 환경 설정
```bash
# 개발 의존성 설치
npm install --include=dev

# 코드 스타일 검사
npm run lint

# 유닛 테스트
npm run test:unit

# 통합 테스트 (SAP 시스템 필요)
npm run test:integration
```

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

**ABAP 개발의 새로운 경험하세요! 🚀**