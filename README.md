# MCP ABAP ADT Server
# MCP ABAP ADT Server

MCP ABAP ADT Server is an open-source Model Context Protocol (MCP) server for SAP ABAP Development Tools (ADT). It provides unified, programmatic access to ABAP system metadata, source code, runtime diagnostics, and repository search via a set of extensible APIs. This project is designed for integration with MCP-capable clients, including editors, automation tools, and custom applications.

---

## Table of Contents

1. [Features](#features)
2. [Architecture & Project Structure](#architecture--project-structure)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Authentication](#authentication)
8. [Docker Usage](#docker-usage)
9. [Testing](#testing)
10. [Extending the Server](#extending-the-server)
11. [Security](#security)
12. [Contributing](#contributing)
13. [License](#license)

---

## Features

- **DDIC Inspection**: Query ABAP tables, structures, CDS views, data elements, domains, and types.
- **ABAP Source Retrieval**: Access programs, classes, function modules, function groups, includes, interfaces, message classes, packages, and transactions.
- **Runtime Diagnostics**: List and inspect ABAP runtime traces and dumps.
- **Repository Search**: Search for ABAP objects using wildcards or regular expressions.
- **Client-Specific Authentication**: Supports per-client SAP credentials via headers, basic auth, or environment variables.
- **Extensible Tool Registry**: Easily add new tools via `src/toolDefinitions.ts`.
- **Server-Sent Events (SSE)**: Real-time event streaming for connected clients.

---

## Architecture & Project Structure

- `src/handlers/` — Individual handler modules for each API/tool.
- `src/toolDefinitions.ts` — Central registry for all MCP tools.
- `src/remoteServer.ts` — HTTP/SSE adapter for remote access.
- `src/lib/` — Utility functions and error handling.
- `tests/` — Jest unit tests for handlers.
- `Dockerfile` — Multi-stage build for containerized deployment.
- `index.ts` — Main entry point for the MCP server.

---

## Requirements

- Node.js 18 or newer (LTS recommended)
- SAP ABAP system with ADT enabled

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt
npm install
```

---

## Configuration

Copy the environment template and set your SAP credentials:

```bash
cp .env.example .env
# Edit .env to set SAP_URL, SAP_USERNAME, SAP_PASSWORD, SAP_CLIENT, etc.
```

Environment variables (see `.env.example`):

- `SAP_URL` — Base URL for your ABAP system (e.g. https://sap.example.com:8000)
- `SAP_USERNAME`, `SAP_PASSWORD` — Credentials for ADT access
- `SAP_CLIENT` — Client number (e.g. 100)
- `MCP_REMOTE_PORT` — HTTP port for remote adapter (default: 6969)
- `MCP_SSE_TOKEN` — Token used by SSE endpoints
- `DANGEROUSLY_OMIT_AUTH` — Set to `true` to disable SSE auth for development only

**Never commit real credentials.** `.env` is gitignored by default.

---

## Usage

### Local Development

Build and start the server:

```bash
npm run build
npm start
```

For development with the MCP inspector:

```bash
npm run build
npm run dev
```

### Remote HTTP Adapter

Expose the MCP server via HTTP/SSE:

```bash
npm run build
npm run start-remote
```

Endpoints:

- `GET /tools` — List available tools and input schemas
- `POST /call` — Invoke a tool by name
- `GET /events`, `GET /sse` — SSE endpoints for real-time events
- `POST /emit` — Emit custom SSE events (dev only)

---

## Authentication

Three supported methods:

1. **Custom Headers** (recommended for VS Code MCP clients)
2. **HTTP Basic Auth**
3. **Environment Variables** (fallback)

See the original README or `docs/CLIENT_AUTH.md` for configuration examples.

---

## Docker Usage

Build and run the server in a container:

```bash
docker build -t mcp-abap-adt:latest .
docker run --rm \
  -e SAP_URL="https://sap.example.com:8000" \
  -e SAP_USERNAME="your_user" \
  -e SAP_PASSWORD="your_password" \
  -e MCP_SSE_TOKEN="your_sse_token" \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

**Notes:**

- The default runtime port is `6969`. Override with `MCP_REMOTE_PORT` or `PORT`.
- Do not bake credentials into the image. Use environment variables or Docker secrets.
- The Dockerfile creates a non-root runtime user; do not run as root in production.

---

## Testing

Run all unit tests with Jest:

```bash
npm test
```

Unit tests are located in the `tests/` directory. New handlers should include tests for both success and error cases.

---

## Extending the Server

- Add new tools in `src/toolDefinitions.ts`.
- Implement handler logic in `src/handlers/`.
- Utilities and error handling are in `src/lib/`.

**Development tips:**

- Run `npm run build` to check for TypeScript errors.
- If you see build errors, check for missing exports or incorrect tool definitions.

---

## Security

- Never commit credentials; use environment variables or secret managers.
- Use a strong `MCP_SSE_TOKEN` and avoid `DANGEROUSLY_OMIT_AUTH=true` outside local development.
- Protect SSE endpoints and remote adapter with TLS and authentication for public deployments.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Add or update tests for new features.
3. Submit a pull request with a clear description.

---

## License

MIT — see `LICENSE`.

---

For questions, issues, or feature requests, please open an issue or contact the maintainer.
**MCP ABAP ADT Server** is a Model Context Protocol (MCP) server for ABAP Development Tools (ADT), providing unified access to SAP ABAP system metadata, source code, and runtime analysis. It exposes a rich set of APIs for DDIC inspection, ABAP object retrieval, trace/dump analysis, and repository search.

## ✨ Features

- **DDIC Inspection**: Structures, tables, CDS views, data elements, domains, and types.
- **ABAP Object Retrieval**: Programs, classes, function modules, function groups, includes, interfaces, message classes, packages, transactions.
- **Runtime Analysis**: ABAP trace listing and details, runtime dump listing and details.
- **Repository Search**: Object search (wildcard/regex).
- **Client-specific Authentication**: Support for individual SAP credentials per MCP client.
- **Extensible Tool Registry**: All APIs are defined in `src/toolDefinitions.ts` for easy extension and MCP client integration.

## 🚀 Getting Started

### Requirements

- Node.js 18+ (LTS recommended)
- Access to an SAP ABAP system with ADT enabled

### Authentication Methods

This MCP server supports multiple authentication methods:

#### 1. Custom Headers (VS Code MCP Recommended)
Configure your MCP client to send SAP credentials via custom headers:

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

#### 2. HTTP Basic Authentication
Alternative method using standard Basic Auth:

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

#### 3. Environment Variables (Fallback)
If client authentication is not provided, the server uses environment variables:
## MCP ABAP ADT — Model Context Protocol server for ABAP

This repository implements an MCP (Model Context Protocol) server that exposes SAP ABAP Development Tools (ADT) functionality as a set of tools. Use it to query DDIC metadata, retrieve ABAP sources, inspect runtime dumps and traces, and run repository searches from any MCP-capable client.

This README is a focused reference: quick install, how to run locally, how to expose a remote MCP HTTP endpoint, SSE notes, Docker hints, tests, and contribution pointers.

## Quick summary

- Language: TypeScript (Node.js)
- Entry point: `dist/index.js` (build output)
- Source: `src/` — handlers are in `src/handlers/` and tools are registered in `src/toolDefinitions.ts`
- Tests: Jest (`npm test`)

## Features

- DDIC inspection (tables, structures, CDS, data elements, domains, types)
- Retrieve ABAP sources (classes, programs, includes, function modules, function groups, interfaces)
- Runtime diagnostics (ABAP short dumps and traces)
- Repository search (object search)
- Simple SSE (Server-Sent Events) channel to push events to connected clients
- Exposes both a local MCP server process mode and a small HTTP "remote" MCP adapter (`start-remote`)

## Requirements

- Node.js 18+ (LTS recommended)
- Access to an SAP ABAP system with ADT enabled (for live queries)

## Get started (local development)

1. Clone and install:

```bash
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt
npm install
```

2. Copy environment template and edit credentials:

```bash
cp .env.example .env
# Edit .env to add SAP_URL, SAP_USERNAME, SAP_PASSWORD, SAP_CLIENT, etc.
```

3. Build and run locally:

```bash
npm run build      # transpile TypeScript to dist/
npm start          # run the built MCP server (production mode)
```

For development with the MCP inspector:

```bash
npm run build
npm run dev        # runs inspector+server combo
```

## Environment variables

Use `.env` or set environment variables directly. Common variables in `.env.example`:

- SAP_URL — base URL for your ABAP system (e.g. https://sap.example.com:8000)
- SAP_USERNAME, SAP_PASSWORD — credentials for ADT access
- SAP_CLIENT — client number (e.g. 100)
- MCP_REMOTE_PORT — HTTP port for remote adapter (default: 6969)
- MCP_SSE_TOKEN — token used by SSE endpoints
- DANGEROUSLY_OMIT_AUTH — set to `true` to disable SSE auth for development only

Never commit real credentials. `.env` is gitignored by default.

## Running as a remote MCP HTTP adapter (remote access)

The project includes a small HTTP adapter implemented in `src/remoteServer.ts`. Use it when you want an HTTP-accessible MCP remote that exposes:

- `GET /tools` — list available tools and input schemas
- `POST /call` — call a tool by name with JSON body { name: string, arguments: { ... } }
- `GET /events` and `GET /sse` — SSE endpoints for real-time events (token protected)
- `POST /emit` — development helper to emit SSE events

Start the remote adapter:

```bash
npm run build
npm run start-remote
```

Remote adapter notes:

- By default it listens on port `6969` (configurable via `MCP_REMOTE_PORT` or `PORT`).
- SSE endpoints require the `MCP_SSE_TOKEN` (or set `DANGEROUSLY_OMIT_AUTH=true` in dev).
- The HTTP adapter implements a small subset of the MCP JSON-RPC transport: `initialize`, `tools/list`, and `tools/call` are supported.

Example: list tools

```bash
curl http://localhost:6969/tools
```

Example: call a tool

```bash
curl -X POST http://localhost:6969/call -H 'Content-Type: application/json' -d '{"name":"GetDDIC_Table","arguments":{"object_name":"SFLIGHT"}}'
```

## Local MCP process mode (embedding the server as an MCP process)

You can run the server as a local MCP process that MCP clients launch directly. This is handy for editor integrations that spawn an external process.

Example VS Code `.vscode/settings.json` snippet:

```json
{
  "mcp.servers": {
    "abap-adt-local": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

When run as a process, the server exposes the MCP HTTP-like JSON-RPC endpoints on STDIO or HTTP depending on the client; the included inspector command (`npm run dev`) demonstrates a typical development workflow.

## SSE (Server-Sent Events)

The remote adapter supports SSE. Use it to push events (tool output, diagnostics) to connected clients.

Client example (browser):

```javascript
const token = 'default-mcp-sse-token';
const es = new EventSource('http://localhost:6969/events?token=' + encodeURIComponent(token));
es.onmessage = e => console.log('msg', e.data);
es.addEventListener('mcptest', e => console.log('mcptest', e.data));
```

Emit an event from the server (dev helper):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:6969/emit -Body (@{ event='mcptest'; data='hello'; topic='mytopic' } | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = 'Bearer default-mcp-sse-token' }
```

## Docker (recommended)

This project includes a multi-stage `Dockerfile` (builder + runtime) that compiles the TypeScript sources and produces a minimal runtime image that runs `node dist/index.js`.

Quick commands (local build):

```bash
# build the image
docker build -t mcp-abap-adt:latest .

# run (map port 6969 -> 6969 and provide SAP credentials via env)
docker run --rm \
  -e SAP_URL="https://sap.example.com:8000" \
  -e SAP_USERNAME="your_user" \
  -e SAP_PASSWORD="your_password" \
  -e MCP_SSE_TOKEN="your_sse_token" \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

Notes:

- The default runtime port exposed by the Dockerfile is `6969`. You can override the port with the `MCP_REMOTE_PORT` or `PORT` environment variable.
- The Dockerfile creates a non-root runtime user; do not run the container as root in production.
- Do not bake credentials into the image. Use environment variables, an external secret store, or Docker secrets.

Example `docker-compose.yml` (development-friendly):

```yaml
version: '3.8'
services:
  mcp:
    build: .
    image: mcp-abap-adt:latest
    ports:
      - "6969:6969"
    environment:
      SAP_URL: "${SAP_URL}"
      SAP_USERNAME: "${SAP_USERNAME}"
      SAP_PASSWORD: "${SAP_PASSWORD}"
      MCP_SSE_TOKEN: "${MCP_SSE_TOKEN}"
    restart: unless-stopped
```

Production tips:

- Use a secret manager (Vault, AWS Secrets Manager, Azure KeyVault) or Docker/Kubernetes secrets to inject credentials.
- For smaller runtime images consider using `node:18-slim` or a distroless base and copying only `dist/` + `package.json`/`package-lock.json` into the runtime image.
- If exposing the remote adapter publicly, place it behind a reverse proxy (TLS, auth) and restrict access to the ADT backend.

## Tests

Run the test suite with Jest:

```bash
npm test
```

Unit tests live under `tests/`. New handlers should include a unit test exercising the happy path and at least one error case.

## Extending and troubleshooting

- Tools are declared in `src/toolDefinitions.ts`. Add new entries to expose new MCP tools and point them at handler functions in `src/handlers/`.
- Handlers should be small, validate input, and call `makeAdtRequest()` or existing utility functions in `src/lib/`.
- If you see build errors, run `npm run build` and inspect the TypeScript output. Common fixes: missing exports in `src/handlers/index.ts` or wrong tool definitions.

## Security and best practices

- Do not store credentials in source. Use a secure secret store for production deployments.
- Use a strong `MCP_SSE_TOKEN` and avoid `DANGEROUSLY_OMIT_AUTH=true` outside local development.
- When exposing the remote adapter publicly, protect it behind a reverse proxy with TLS and authentication.

## Contributing

Contributions are welcome. Typical workflow:

1. Fork and create a feature branch.
2. Add or update tests for new behavior.
3. Open a pull request with a clear description.

## License

MIT — see the `LICENSE` file.

---

If anything in this README looks inaccurate for your environment, tell me which detail to update and I will patch it.
