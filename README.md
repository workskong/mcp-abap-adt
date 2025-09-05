# mcp-abap-adt

MCP server for SAP ABAP ADT — a Model Context Protocol (MCP) adapter that exposes ABAP metadata, source code, and diagnostics as tools. This repository implements a TypeScript-based MCP server and an optional HTTP "remote" wrapper that exposes the same tools over HTTP and Server-Sent Events (SSE).

## Checklist (what this README covers)

- Project purpose and quick overview
- Prerequisites and installation
- Build and local (stdio) run
- Remote HTTP/SSE server mode
- Docker image: build and run
- Configuration and environment variables
- Available tools (summary)
- Development, testing, and troubleshooting notes

## Project overview

This project implements an MCP server that exposes many ABAP/ADT focused tools (search, read sources, retrieve DDIC definitions, traces, runtime dumps, etc.). The core server communicates over stdio using the MCP JSON-RPC transport by default (intended for use by MCP clients and inspectors). An HTTP "remote" wrapper is available which exposes endpoints for listing and calling tools, an MCP-compatible JSON-RPC endpoint, and an SSE endpoint for streaming events.

Key components:

- `index.ts` — program entry. Starts the MCP server; supports `--remote` to start the HTTP wrapper.
- `src/lib/remoteServer.ts` — Express-based HTTP wrapper that provides `/tools`, `/call`, `/events`, and JSON-RPC endpoints.
- `src/lib/toolDefinitions.ts` — list of tool definitions and input schemas backed by handlers in `src/handlers/*`.
- `src/lib/config.ts` — configuration helpers (note: `getPort()` requires `PORT` to be set).
- `Dockerfile` — multi-stage build + runtime image for production.

Versions: the package.json file lists the package version; the runtime prints a server version string in a few places (they may differ if not synchronized).

## Prerequisites

- Node.js 18+ (recommended)
- npm
- TypeScript (installed via devDependencies)

On Windows PowerShell, when setting environment variables in examples use `$env:PORT = '6969'` or `-e` when using Docker.

## Quickstart — install, build, run (local/stdio)

1. Install dependencies:

```powershell
npm ci
```

2. Build the TypeScript sources:

```powershell
npm run build
```

3. Run the MCP server in stdio mode (default):

```powershell
npm start
```

This starts the server that communicates over stdio (for MCP inspector tools). It will export tools via the MCP ListTools/CallTool handlers.

## Remote HTTP mode (start a small HTTP server)

The project provides a `--remote` mode that starts an Express HTTP server which exposes the tools and an SSE endpoint.

Important: The remote server's configuration code requires `PORT` to be set in the environment. If `PORT` is not set the process will fail early with an error (see `src/lib/config.ts`). Set `PORT` before starting remote mode.

Examples (PowerShell):

```powershell
$env:PORT = '6969'
# mcp-abap-adt

Lightweight MCP adapter for SAP ABAP ADT. Exposes ABAP metadata, sources, and diagnostics as MCP tools. Includes a stdio MCP server and an optional HTTP/SSE remote wrapper.

## Quick start

- Install: `npm ci`
- Build: `npm run build`
- Run (stdio): `npm start`
- Run remote HTTP server (set `PORT` first):

```powershell
$env:PORT = '6969'; npm run start-remote
```

## Remote HTTP endpoints

- `GET /` — status
- `GET /tools` — list tools and schemas
- `POST /call` — call a tool
- `GET /events` or `/sse` — SSE stream (auth required unless disabled)
- `POST /emit` — emit test SSE event
- `POST /` — MCP JSON-RPC transport (initialize, tools/list, tools/call)

Authentication: send SAP credentials via `Authorization: Basic ...` or headers `X-Username` + `X-Password`.

## MCP client configuration examples

Keep these JSON snippets as-is in your client configuration.

Visual Studio Code (inspector) example:

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

Eclipse example:

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

## Docker

- Build: `docker build -t mcp-abap-adt .`
- Run: `docker run --rm -e PORT=6969 -p 6969:6969 mcp-abap-adt`

Note: runtime `HEALTHCHECK` uses `wget` on `/health`; ensure `wget` is available or adjust the `Dockerfile`.

## Environment

- `PORT` (required for remote HTTP)
- `NODE_ENV`
- `MCP_SSE_TOKEN` (SSE auth token)
- `DANGEROUSLY_OMIT_AUTH` (set `true` to disable SSE auth)

## Tools (summary)

- SearchObject, Get_Class, Get_Function, Get_Program, GetDDIC_* (CDS, Table, TypeInfo, ...), GetRuntimeDumps, Get_ABAPTraces, API_Releases, DataPreview, etc.
- See `src/lib/toolDefinitions.ts` for full list and schemas.

## Dev & tests

- Build: `npm run build`
- Test: `npm test`
- Dev/inspector: `npm run dev`

## Troubleshooting

- If server fails with `PORT` error, set `PORT` before starting remote mode.
- If Docker healthcheck fails, add `wget`/`curl` or change the healthcheck.
- For auth issues, use Basic Auth or `X-Username`/`X-Password` headers.

## License

MIT — see `LICENSE`.

Repository: https://github.com/workskong/mcp-abap-adt

```

Notes about the included `Dockerfile` in this repo:

- The `Dockerfile` is a multi-stage build that runs `npm run build` in a builder stage and copies `dist/` into the runtime image.
- The `Dockerfile` sets `ENV PORT=6969` and exposes `6969` by default. When running the container you can override `PORT` using `-e PORT=<num>`.
- The runtime `HEALTHCHECK` uses `wget` to probe the `/health` path. Alpine images do not guarantee `wget` is installed; if you rely on the healthcheck in your environment, ensure `wget` or an equivalent (curl) is available in the runtime image or adapt the `HEALTHCHECK` accordingly.

## Configuration / Environment variables

- `PORT` — (required for remote HTTP mode) TCP port to bind the remote HTTP server. The code reads this from environment and will throw if not set.
- `NODE_ENV` — Node environment (production/development). The Docker runtime stage sets `NODE_ENV=production` by default.
- `MCP_SSE_TOKEN` — token used to protect SSE endpoints (default: `default-mcp-sse-token` if unset).
- `DANGEROUSLY_OMIT_AUTH` — when set to `true`, SSE auth checks are skipped (use only for local testing).
- `.env` — the remote server loads `.env` (but note that some configuration helpers read `PORT` at module-initialization time; ensure `.env` is loaded early or set `PORT` in the environment before starting remote mode).

## Available tools (summary)

This MCP adapter exposes several tools. Each tool has a name, description, and an input schema. Example tool names include:

- API_Releases — Retrieve API Release information for an ADT object
- DataPreview — Preview ABAP data for a DDIC entity
- GetDDIC_CDS, GetDDIC_DataElements, GetDDIC_Domains, GetDDIC_Structure, GetDDIC_Table, GetDDIC_TypeInfo — DDIC-related lookups
- Get_ABAPTraces, Get_ABAPTracesDetails — ABAP trace information
- Get_Class, Get_Function, Get_FunctionGroup, Get_Include, Get_Interface — source retrieval for ABAP objects
- Get_MessageClass, Get_Package, Get_Program, Get_Transaction — misc ABAP metadata
- GetRuntimeDumpDetails, GetRuntimeDumps — runtime dump info
- SearchObject — search ABAP objects

See `src/lib/toolDefinitions.ts` for full input schemas and handler mapping.

## Development

- Run tests:

```powershell
npm test
```

- Start in development/inspector mode (wraps the process with MCP inspector tooling):

```powershell
npm run dev
```

- Build TypeScript:

```powershell
npm run build
```

## Troubleshooting

- If the remote server exits immediately with an error about `PORT`, make sure `PORT` is set in the environment before launching remote mode. Example:

```powershell
$env:PORT = '6969'; npm run start-remote
```

- Healthcheck failing in Docker: confirm `wget` is present in the runtime image or update the `Dockerfile` to install `wget`/`curl` or change the `HEALTHCHECK` to use a small Node-based script.

- Authentication issues calling tools: the remote wrapper supports Basic Auth and custom `X-Username`/`X-Password` headers. Ensure you pass credentials if the tool requires access to the SAP system.

## Contributing

Contributions are welcome. Please fork, make changes, and open a pull request. Keep TypeScript types and tests updated. Run `npm run build` and `npm test` before submitting a PR.

## License

MIT — see `LICENSE`.

## Contact

Repository: https://github.com/workskong/mcp-abap-adt

If you want, I can also add quick example requests (curl and PowerShell) for calling a few specific tools — tell me which tools you'd like examples for.

