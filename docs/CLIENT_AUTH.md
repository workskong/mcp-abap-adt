(This file explains how clients provide SAP credentials to the MCP server. It is written for beginners and focused on this repository.)

# Client-specific SAP authentication (MCP server) — Beginner friendly guide

Purpose
- Help beginners configure a client to send SAP credentials to the MCP server in this repository.
- Show two supported methods, examples, quick tests, and a troubleshooting checklist.

Checklist (what I'll cover)
- Explain the two supported auth methods.
- Show example `mcp.json` configurations for VS Code MCP.
- Show how to build Basic auth headers in PowerShell and bash.
- Show simple curl/PowerShell checks to confirm headers arrive.
- Explain `.env` fallback variables used by the server.

Who should read this
- Developers configuring the VS Code MCP client or any HTTP client to connect to this project.

---

## 1) Two supported authentication methods (quick)

- Custom headers (recommended for VS Code MCP): the client sends `X-Username` and `X-Password` headers.
- HTTP Basic Authentication: the client sends `Authorization: Basic <base64>`.

Either method allows different clients to use different SAP accounts. If a client sends no credentials, the server falls back to environment variables from `.env`.

## 2) How it works (simple flow)

1. Client opens a connection and sends HTTP headers (custom headers or Authorization).
2. The MCP server reads headers from the incoming request.
3. Server extracts username and password and uses them to open a connection to the SAP system for that client session.
4. If no credentials are provided, server uses default values from `.env`.

This lets multiple clients connect at once with different SAP accounts.

## 3) VS Code MCP client examples

These examples show how to prompt for credentials and send them in requests to the MCP server running locally (default SSE URL used in this repo: `http://localhost:6969`).

Example: Custom headers (recommended)

```json
{
  "inputs": [
    { "id": "sap_user", "type": "promptString", "description": "SAP Username", "password": false },
    { "id": "sap_pass", "type": "promptString", "description": "SAP Password", "password": true }
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

Why use custom headers: the client can prompt for credentials each session and avoids storing passwords on disk.

Example: HTTP Basic Authentication

```json
{
  "inputs": [
    { "id": "basic_user", "type": "promptString", "description": "SAP Username", "password": false },
    { "id": "basic_pass", "type": "promptString", "description": "SAP Password", "password": true }
  ],
  "servers": {
    "mcp-abap-adt": {
      "type": "sse",
      "url": "http://localhost:6969",
      "headers": {
        "Authorization": "Basic ${base64(input:basic_user + ':' + basic_pass)}"
      }
    }
  }
}
```

If your client cannot compute the base64 expression inline, build it manually (examples below).

## 4) Build Basic auth header manually

PowerShell (Windows):

```powershell
$plain = "username:password"
$base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($plain))
"Authorization: Basic $base64"
```

bash (macOS / Linux):

```bash
echo -n 'username:password' | base64
# prepend: Authorization: Basic <base64-value>
```

## 5) Quick network tests (confirm headers reach the server)

Custom headers test (curl):

```bash
curl -v -H "X-Username: dev00" -H "X-Password: DevPassword123" http://localhost:6969/
```

PowerShell example for Basic auth header:

```powershell
$b = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("dev00:DevPassword123"))
curl -v -H ("Authorization: Basic $b") http://localhost:6969/
```

Notes:
- The MCP server exposes multiple endpoints for handlers; these curl samples only check that headers are transmitted to the server.
- Use `-v` or `--verbose` with curl to inspect request headers.

## 6) Fallback: `.env` environment variables

If a client doesn't send credentials, the server uses values from `.env`. Typical variables in this project:

- SAP_URL (e.g. `http://localhost:50000`)
- SAP_USERNAME
- SAP_PASSWORD
- SAP_CLIENT (e.g. `001`)
- SAP_LANGUAGE (e.g. `en`)
- TLS_REJECT_UNAUTHORIZED (0 for local/testing with self-signed certs)

Example `.env` snippet:

```env
SAP_URL=http://localhost:50000
SAP_USERNAME=dev00
SAP_PASSWORD=Welcome2025
SAP_CLIENT=001
SAP_LANGUAGE=en
TLS_REJECT_UNAUTHORIZED=0
```

## 7) Security basics (what beginners should know)

- Never commit real passwords to source control.
- Use HTTPS for production so credentials are encrypted in transit.
- Prefer the custom-header flow in VS Code because it prompts the user and avoids saving secrets.
- Limit SAP account permissions to the minimum required.

## 8) Troubleshooting checklist

1. Is the MCP server running? Start it with:

```powershell
npm run start-remote
```

2. Are credentials correct? Try them directly against SAP if you can.
3. Are request headers present? Use `curl -v` or a request inspector (proxy) to verify.
4. Check server logs for authentication or connection errors.
5. If using TLS, verify certificates or `TLS_REJECT_UNAUTHORIZED` is set appropriately for development.

## 9) Try it locally (quick steps)

1. Install dependencies if needed:

```powershell
npm install
```

2. Start the remote MCP server used by this project:

```powershell
npm run start-remote
```

3. Connect a client using one of the `mcp.json` examples above, or test with curl/PowerShell.

---

If you want, I can add:
- step-by-step VS Code screenshots for setting inputs,
- a short test script that sends headers to the handler used in `src/handlers/handle_SearchObject.ts`,
- example server log lines that indicate successful or failed SAP authentication.
