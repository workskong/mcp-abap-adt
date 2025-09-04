# MCP 클라이언트별 SAP 인증 설정 가이드

이 MCP 서버는 다양한 인증 방식을 통해 클라이언트별로 개별적인 SAP 아이디와 비밀번호를 사용할 수 있도록 지원합니다.

## 지원하는 인증 방식

### 방식 1: 커스텀 헤더 (VS Code MCP 권장)

VS Code MCP 클라이언트에서 사용하는 방식으로, `X-Username`과 `X-Password` 헤더를 사용합니다.

#### VS Code 설정 예시 (`mcp.json`)

```json
{
  "inputs": [
    {
      "id": "sap_user",
      "type": "promptString",
      "description": "SAP Username",
      "password": false
    },
    {
      "id": "sap_pass",
      "type": "promptString", 
      "description": "SAP Password",
      "password": true
    }
  ],
  "servers": {
    "mcp-abap-adt": {
      "type": "sse",
      "url": "http://localhost:6969",
      "headers": {
        "X-Username": "${input:sap_user}",
        "X-Password": "${input:sap_pass}"
      }
    }
  }
}
```

### 방식 2: HTTP Basic Authentication

표준 HTTP Basic Authentication을 사용하는 방식입니다.

```json
{
  "inputs": [
    { 
      "id": "basic_user", 
      "type": "promptString", 
      "description": "SAP Username", 
      "password": false 
    },
    { 
      "id": "basic_pass", 
      "type": "promptString", 
      "description": "SAP Password", 
      "password": true 
    }
  ],
  "servers": {
    "mcp-abap-adt": {
      "type": "sse",
      "url": "http://localhost:6969",
      "headers": {
        "Authorization": "Basic ${base64(input:basic_user + ':' + input:basic_pass)}"
      }
    }
  }
}
```

## 동작 원리

1. **사용자 입력**: MCP 클라이언트가 시작될 때 사용자에게 SAP 아이디와 비밀번호를 입력하라는 프롬프트가 표시됩니다.

2. **인증 헤더 생성**: 입력된 아이디와 비밀번호가 Base64로 인코딩되어 HTTP Basic Authentication 헤더에 포함됩니다.

3. **서버 처리**: MCP 서버는 Authorization 헤더에서 SAP 인증 정보를 추출하여 SAP 시스템에 접속합니다.

4. **폴백 처리**: 클라이언트가 인증 정보를 제공하지 않으면 서버는 `.env` 파일의 기본값을 사용합니다.

## 다중 클라이언트 지원

여러 클라이언트가 동시에 서로 다른 SAP 계정으로 접속할 수 있습니다:

**개발자 클라이언트:**
- 사용자 입력: `dev00` / `DevPassword123`

**관리자 클라이언트:**
- 사용자 입력: `admin` / `AdminPassword456`

각 클라이언트는 독립적으로 자신의 SAP 계정으로 인증됩니다.

## 보안 특징

- ✅ 비밀번호가 설정 파일에 저장되지 않음
- ✅ 사용자가 매번 직접 입력
- ✅ HTTPS를 사용하면 전송 중 암호화됨
- ✅ 각 클라이언트가 독립적인 인증 정보 사용

## 폴백 설정

클라이언트에서 인증 정보를 제공하지 않은 경우, 서버는 `.env` 파일의 다음 환경변수를 사용합니다:

```bash
SAP_URL=http://localhost:50000
SAP_USERNAME=dev00
SAP_PASSWORD=Welcome2025
SAP_CLIENT=001
SAP_LANGUAGE=en
TLS_REJECT_UNAUTHORIZED=0
```

## 테스트 방법

1. MCP 서버 시작:
   ```bash
   npm run start-remote
   ```

2. 클라이언트 연결 시 사용자 아이디와 비밀번호 입력

3. SAP 시스템 연결 확인

## 주의사항

- 프로덕션 환경에서는 HTTPS를 사용하여 보안을 강화하세요
- SAP 시스템의 사용자 계정이 필요한 권한을 가지고 있는지 확인하세요
- 네트워크 연결과 방화벽 설정을 확인하세요
