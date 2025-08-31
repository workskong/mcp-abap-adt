# SSE (Server-Sent Events) for MCP Remote Server

This document explains how to use the SSE endpoints added to the MCP remote server.

## Endpoints

- `GET /events` or `GET /sse`
  - Opens an SSE stream.
  - Authentication: Provide `Authorization: Bearer <token>` header or `?token=<token>` query parameter unless `DANGEROUSLY_OMIT_AUTH=true` is set in the environment.
  - Optional query parameter `subscribe` to restrict events: `?subscribe=toolA,toolB`

- `POST /emit`
  - Development helper to manually emit events from HTTP clients.
  - Body: `{ event: string, data: any, topic?: string }`
  - If `topic` is provided, only clients subscribed to that topic receive the event.

## Environment

- `MCP_SSE_TOKEN` - token required by default for SSE connections and /emit.
- `DANGEROUSLY_OMIT_AUTH=true` - disable auth checks (only for development).

Note: This repo includes a local `.env` file. A secure token has been generated and stored in `.env` as `MCP_SSE_TOKEN`. Ensure `.env` is not committed to VCS (this repo's `.gitignore` already excludes `.env`).

## Example Usage

Start the server (remote mode):

```powershell
npm run build
npm run start-remote
```

Connect with `EventSource` (browser):

```javascript
const token = 'default-mcp-sse-token';
const es = new EventSource('http://localhost:6969/events?token=' + encodeURIComponent(token));
es.onmessage = e => console.log('msg', e.data);
es.addEventListener('mcptest', e => console.log('mcptest', e.data));
```

Emit an event (PowerShell):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:6969/emit -Body (@{ event='mcptest'; data='hello'; topic='mytopic' } | ConvertTo-Json) -ContentType 'application/json' -Headers @{ Authorization = 'Bearer default-mcp-sse-token' }
```

To subscribe to a topic on connect:

```javascript
const es = new EventSource('http://localhost:6969/events?token='+token+'&subscribe=mytopic');
```

## Notes

- This SSE implementation is simple and suitable for local development and small deployments. For production use behind proxies or load balancers, ensure the proxy supports long-lived connections and does not buffer the stream.
