# mcp-abap-adt

Lightweight **MCP adapter for SAP ABAP ADT**.  
Exposes ABAP metadata, source code, and diagnostics as **MCP tools**.  
Runs as either:
- **MCP stdio server** (default)  
- **Remote HTTP/SSE server** (optional wrapper)

***

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18  
- npm  
- TypeScript (installed through devDependencies)  

On Windows (PowerShell) use `$env:PORT = '6969'` for setting env variables.  

### Install and Build
```powershell
npm ci
npm run build
```

### Run (local / stdio mode)
```powershell
npm start
```
> Server runs over stdio (for MCP inspector / clients).

### Run (remote HTTP server)
```powershell
$env:PORT = "6969"; npm run start-remote
```
> Remote mode **requires `PORT`**. Process exits if it’s missing.  

***

## 🌐 Remote HTTP Endpoints

| Method | Path        | Purpose |
|--------|-------------|---------|
| GET    | `/`         | Status / health info |
| GET    | `/tools`    | List tools + input schemas |
| POST   | `/call`     | Call a tool |
| GET    | `/events`   | Receive Server-Sent Events |
| POST   | `/emit`     | Emit test SSE event |
| POST   | `/`         | MCP JSON-RPC transport |

### Authentication
- Basic Auth: `Authorization: Basic ...`  
- Or headers: `X-Username` + `X-Password`  

***

## 🔌 MCP Client Config Examples

### VS Code

#### Remote (HTTP/SSE)
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
- Uses SSE over HTTP; credentials passed via custom headers supported by the remote wrapper.

#### Local (stdio)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "type": "stdio",
      "command": "node",
      "cwd": "C:/Users/{user}/Documents/mcp-abap-adt",
      "args": [
        "C:/Users/{user}/Documents/mcp-abap-adt/dist/index.js"
      ]
    }
  }
}
```
- Starts the server with Node and connects via stdio; paths are Windows-style as provided.

### Eclipse

#### Local (stdio)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "command": "node",
      "args": [
        "C:/Users/{user}/Documents/mcp-abap-adt/dist/index.js"
      ]
    }
  }
}
```
- Launches the Node process directly; Eclipse MCP client consumes stdio transport from the spawned process.

#### Remote (HTTP/SSE)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "url": "http://localhost:6969",
      "requestInit": {
        "headers": {
          "X-Username": "DEV00",
          "X-Password": "Welcome2025"
        }
      }
    }
  }
}
```
- Connects to the remote HTTP server; headers carry SAP credentials as supported by the wrapper.

**Notes:**
- Remote mode requires the server to be started with the HTTP wrapper and a set PORT (e.g., 6969) before clients connect.
- For stdio mode, ensure the TypeScript build has produced `dist/index.js` and that Node.js 18+ is in PATH.

***

## 🐳 Docker

Build:
```powershell
docker build -t mcp-abap-adt .
```

Run:
```powershell
docker run --rm -e PORT=6969 -p 6969:6969 mcp-abap-adt
```

**Note:** The `HEALTHCHECK` uses `wget /health`. Install `wget`/`curl` or update the Dockerfile if missing.  

***

## ⚙️ Environment Variables

| Variable   | Required | Purpose |
|------------|----------|---------|
| `PORT`     | Yes (remote mode) | TCP port for HTTP server |
| `NODE_ENV` | No       | `production` or `development` |

***

## 🛠 Tools

Each tool has: `name`, `description`, `inputSchema`.  
For live schemas → `GET /tools` endpoint.

| Tool | Description | Key Inputs |
|------|-------------|------------|
| `SearchObject` | Search for ABAP objects | `query` (string, required) |
| `Get_Class` | Get ABAP class source | `class_name` |
| `Get_Function` | Get function module source | `function_name`, `function_group` |
| `Get_Program` | Get ABAP program source | `program_name` |
| `GetDDIC_Table` | Get DDIC table definition | `object_name` |
| `GetDDIC_CDS` | Get CDS view definition | `object_name` |
| `DataPreview` | Preview rows of DDIC entity | `ddicEntityName`, `rowNumber=100` |
| `GetRuntimeDumps` | List runtime dumps (ST22) | `start_date`, ... |
| `Get_ABAPTraces` | Get ABAP traces | `user`, `maxResults=5` |
| `API_Releases` | Get API release data | `query` |

*(see `src/lib/toolDefinitions.ts` for full catalog)*

***

## 📖 Examples

### Call a tool (PowerShell)
```powershell
Invoke-RestMethod -Uri http://localhost:6969/call -Method POST `
  -Headers @{ "X-Username"="DEV00"; "X-Password"="Welcome2025" } `
  -Body (@{ tool="SearchObject"; arguments=@{ query="SBOOK" } } | ConvertTo-Json -Compress)
```

### Call a tool (curl)
```bash
curl -X POST http://localhost:6969/call \
     -H "X-Username: DEV00" -H "X-Password: Welcome2025" \
     -H "Content-Type: application/json" \
     -d '{"tool":"SearchObject","arguments":{"query":"SBOOK"}}'
```

***

## 👩‍💻 Development & Testing
```powershell
npm run build
npm run dev     # dev + inspector
npm test
```

How to add a new tool:
1. Create handler in `src/handlers/handle_MyTool.ts`
2. Export in `src/lib/handlerExports.ts`
3. Add entry in `src/lib/toolDefinitions.ts`
4. Build + test

***

## ❗ Troubleshooting
- **Error: PORT required** → set `$env:PORT = "6969"`.  
- **Healthcheck fails** → confirm `wget`/`curl` is installed in container.  
- **Auth issues** → try Basic Auth or `X-Username`/`X-Password`.  

***

## 📜 License
MIT — see `LICENSE`.

Repository: [https://github.com/workskong/mcp-abap-adt](https://github.com/workskong/mcp-abap-adt)

