# mcp-abap-adt

Lightweight MCP adapter for SAP ABAP ADT.
Exposes ABAP metadata, source code, and diagnostics as MCP tools.
The server can run in two modes:
- stdio (default) — intended for MCP clients that spawn the process and communicate over stdio.
- remote (HTTP + SSE) — an optional wrapper that exposes HTTP endpoints and Server-Sent Events.

***

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm
- TypeScript (installed via devDependencies)

On Windows PowerShell, set environment variables like:
```powershell
$env:PORT = '6969'
```

### Install and Build
```powershell
npm ci
npm run build
```

### Run (local / stdio mode)
```powershell
npm start
```
This runs the server over stdio (for MCP inspector / clients).

### Run (remote HTTP server)
```powershell
npm run start-remote
```
Remote mode requires `PORT` to be set; the process will exit if it is missing.

***

## 🌐 Remote HTTP Endpoints

The remote wrapper exposes these endpoints (when started with `--remote`):

| Method | Path    | Purpose |
|--------|---------|---------|
| GET    | `/`     | Status / health info |
| GET    | `/tools`| List tools and input schemas |
| POST   | `/call` | Call a tool by name (application/json) |
| GET    | `/events` | Server-Sent Events stream |
| POST   | `/emit` | Emit a test SSE event (dev only) |
| POST   | `/`     | MCP JSON-RPC transport (alternative endpoint) |

### Authentication
- Basic Auth via the standard `Authorization: Basic ...` header is supported.
- The server also accepts header-based credentials. Use `X-Username`/`X-Password` or `X-SAP_USERNAME`/`X-SAP_PASSWORD` depending on your client configuration. The wrapper will check headers and Basic Auth.

***

## 🔌 MCP Client Config Examples

Below are examples for MCP clients (VS Code, Eclipse). Preserve your actual credentials; the examples use placeholders.

### VS Code

#### Remote (HTTP/SSE)
```json
{
  "inputs": [
    { "id": "SAP_USERNAME", "type": "promptString", "description": "SAP Username", "password": false },
    { "id": "SAP_PASSWORD", "type": "promptString", "description": "SAP Password", "password": true },
    { "id": "SAP_CLIENT", "type": "promptString", "description": "SAP Client", "password": false },
    { "id": "SAP_LANGUAGE", "type": "promptString", "description": "SAP Language", "password": false }
  ],
  "servers": {
    "mcp-abap-adt": {
      "type": "sse",
      "url": "http://localhost:6969",
      "headers": {
        "X-SAP_USERNAME": "${input:SAP_USERNAME}",
        "X-SAP_PASSWORD": "${input:SAP_PASSWORD}",
        "X-SAP_CLIENT": "${input:SAP_CLIENT}",
        "X-SAP_LANGUAGE": "${input:SAP_LANGUAGE}"
      }
    }
  }
}
```

#### Local (stdio)
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
        "SAP_LANGUAGE": "EN"
      }
    }
  }
}
```

These snippets show either SSE over HTTP (remote) or launching the server as a child process and communicating over stdio (local). Ensure `dist/index.js` exists after building.

### Eclipse

#### Remote (HTTP/SSE)
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
          "X-SAP_LANGUAGE": "EN"
        }
      }
    }
  }
}
```

#### Local (stdio)
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
        "SAP_LANGUAGE": "EN"
      }
    }
  }
}
```
Eclipse can either connect to the remote HTTP wrapper or spawn the server and communicate via stdio.

Notes:
- Remote mode requires starting the server with `--remote` and a `PORT` (for example, 6969) before clients connect.
- For stdio mode, ensure the TypeScript build produced `dist/index.js` and that Node.js 18+ is available in PATH.

***

## 🐳 Docker

Build:
```powershell
docker build -t mcp-abap-adt .
```

Run (example):
```powershell
docker run --rm -e PORT=6969 -p 6969:6969 mcp-abap-adt
```

Note: The image's HEALTHCHECK may use `wget`/`curl` against `/health`; ensure those tools are available in the image or update the Dockerfile.

***

## ⚙️ Environment Variables

| Variable   | Required | Purpose |
|------------|----------|---------|
| `PORT`     | Yes (remote mode) | TCP port for HTTP server |
| `NODE_ENV` | No       | `production` or `development` |
| `SAP_USERNAME` / `X-Username` | No | SAP username (can be supplied via header or env for local stdio mode)
| `SAP_PASSWORD` / `X-Password` | No | SAP password (can be supplied via header or env)
| `SAP_CLIENT` | No | SAP client number (optional)
| `SAP_LANGUAGE` | No | Default language (optional)

***

## 🛠 Tools

Each tool has: `name`, `description`, `inputSchema`.  
For live schemas → `GET /tools` endpoint.

## 🛠 Tools

Each tool exposes `name`, `description` and `inputSchema` via the `/tools` endpoint. The server ships the following tools (see `src/lib/toolDefinitions.ts` for the canonical list):

| Tool | Description | Key Inputs |
|------|-------------|------------|
| `SearchObject` | Search for ABAP objects | `query` (string)
| `Get_Class` | Retrieve ABAP class source | `class_name`
| `Get_Function` | Retrieve function module source | `function_name`, `function_group`
| `Get_FunctionGroup` | Retrieve function group source | `function_group`
| `Get_Program` | Retrieve ABAP program source | `program_name`
| `Get_Include` | Retrieve ABAP include source | `include_name`
| `Get_Interface` | Retrieve ABAP interface source | `interface_name`
| `Get_MessageClass` | Retrieve message class info | `MessageClass`
| `Get_Package` | Retrieve package details | `package_name`
| `GetDDIC_Table` | Retrieve DDIC table definition | `object_name`
| `GetDDIC_CDS` | Retrieve CDS view definition | `object_name`
| `GetDDIC_DataElements` | Retrieve data element definition | `object_name`
| `GetDDIC_Domains` | Retrieve domain definition | `object_name`
| `GetDDIC_Structure` | Retrieve DDIC structure | `object_name`
| `GetDDIC_TypeInfo` | Retrieve DDIC type information | `object_name`
| `DataPreview` | Preview ABAP data for a DDIC entity | `ddicEntityName`, `rowNumber`
| `GetRuntimeDumps` | Retrieve ABAP runtime dump list | `start_date`, `end_date`, ...
| `GetRuntimeDumpDetails` | Retrieve detailed runtime dump info | `id`
| `Get_ABAPTraces` | Retrieve ABAP trace information | `user`, `maxResults`
| `Get_ABAPTracesDetails` | Retrieve ABAP trace details | `id`, `type`
| `API_Releases` | Retrieve API release info for an ADT object | `query`

Use `GET /tools` to retrieve the full catalog and JSON Schemas for each tool.

***

## 📖 Examples

### Call a tool (PowerShell)
```powershell
Invoke-RestMethod -Uri http://localhost:6969/call -Method POST \
  -Headers @{ "X-Username"="DEV00"; "X-Password"="XXXX" } \
  -Body (@{ tool="SearchObject"; arguments=@{ query="SBOOK" } } | ConvertTo-Json -Compress)
```

### Call a tool (curl)
```bash
curl -X POST http://localhost:6969/call \
     -H "X-Username: DEV00" -H "X-Password: XXXX" \
     -H "Content-Type: application/json" \
     -d '{"tool":"SearchObject","arguments":{"query":"SBOOK"}}'
```

***

## 👩‍💻 Development & Testing
```powershell
npm run build
npm run dev     # run with inspector (requires npx @modelcontextprotocol/inspector)
npm test
```

How to add a new tool:
1. Create a handler in `src/handlers/handle_MyTool.ts` (follow existing handler patterns).
2. Export it from `src/lib/handlerExports.ts`.
3. Add a definition in `src/lib/toolDefinitions.ts` with name, description and inputSchema.
4. Build and run tests.

***

## ❗ Troubleshooting
Troubleshooting:
- Error: PORT required → set `$env:PORT = "6969"` (PowerShell) or export `PORT` in your environment.
- Healthcheck fails → confirm `wget`/`curl` is available in the container image or adjust the Dockerfile.
- Authentication issues → try Basic Auth or headers (`X-Username`/`X-Password` or `X-SAP_USERNAME`/`X-SAP_PASSWORD`).

***

## 📜 License
MIT — see `LICENSE`.

Repository: https://github.com/workskong/mcp-abap-adt

