import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { sseHandler, sendSseEvent, getConnectedCount } from './sse';
import { DEFAULT_PORT } from './config';

// Load .env (if present) so users can configure PORT and other settings
dotenv.config();

type ToolDef = any;

// Function to extract user authentication information from HTTP Basic Authentication header
function extractBasicAuth(req: Request): { username: string; password: string } | null {
  const authHeader = req.headers?.authorization || '';
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('basic ')) {
    try {
      const base64Credentials = authHeader.slice(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      if (username && password) {
        return { username, password };
      }
    } catch (error) {
      console.warn('Failed to parse Basic Auth header:', error);
    }
  }
  return null;
}

// Function to extract user authentication information from custom headers (X-Username, X-Password)
function extractCustomHeaders(req: Request): { username: string; password: string } | null {
  const username = req.headers['x-username'] as string;
  const password = req.headers['x-password'] as string;

  if (username && password) {
    return { username, password };
  }
  return null;
}

// Function to extract user authentication information by trying all authentication methods
function extractAuthInfo(req: Request): { username: string; password: string } | null {
  // 1. Check custom headers first (used by VS Code MCP client)
  const customAuth = extractCustomHeaders(req);
  if (customAuth) {
    return customAuth;
  }

  // 2. Check Basic Auth header
  const basicAuth = extractBasicAuth(req);
  if (basicAuth) {
    return basicAuth;
  }

  return null;
}

export async function startRemoteServer(toolDefinitions: ToolDef[], port = DEFAULT_PORT) {
  const app = express();
  app.use(bodyParser.json());

  app.get('/tools', (_req: Request, res: Response) => {
    const tools = toolDefinitions.map((t: any) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
    res.json({ tools });
  });

  app.post('/call', async (req: Request, res: Response) => {
    try {
      const { name, arguments: args } = req.body;
      if (!name) return res.status(400).json({ error: 'Missing tool name' });
      const tool = toolDefinitions.find(t => t.name === name);
      if (!tool) return res.status(404).json({ error: `Unknown tool: ${name}` });

      // validate required
      const provided = args || {};
      if (Array.isArray(tool.inputSchema?.required)) {
        for (const reqKey of tool.inputSchema.required) {
          if (provided[reqKey] === undefined) {
            return res.status(400).json({ error: `Missing required parameter: ${reqKey}` });
          }
        }
      }

      // Attempt all authentication methods to extract SAP user information
      const authInfo = extractAuthInfo(req);
      const enrichedArgs = {
        ...provided,
        _sapUsername: authInfo?.username,
        _sapPassword: authInfo?.password
      };

      const result = await tool.handler(enrichedArgs);
      // some handlers return MCP error shapes; pass through
      res.json(result as any);
    } catch (err: any) {
      res.status(500).json({ error: err && err.message ? err.message : String(err) });
    }
  });

  // SSE endpoint for clients that want server-sent events from this MCP remote
  // Authentication: either set DANGEROUSLY_OMIT_AUTH=true in env to skip, or provide
  // Authorization: Bearer <token> header or ?token=<token> query param.
  const sseToken = process.env.MCP_SSE_TOKEN || 'default-mcp-sse-token';
  function checkAuth(req: Request) {
    if (process.env.DANGEROUSLY_OMIT_AUTH === 'true') return true;
    const h = req.headers?.authorization || '';
    if (typeof h === 'string' && h.toLowerCase().startsWith('bearer ')) {
      const t = h.slice(7).trim();
      return t === sseToken;
    }
    if (req.query && req.query.token) return req.query.token === sseToken;
    return false;
  }

  app.get('/events', (req: Request, res: Response) => {
    if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
    return sseHandler(req, res);
  });
  // Backwards-compatible path expected by some inspectors/proxies
  app.get('/sse', (req: Request, res: Response) => {
    if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
    return sseHandler(req, res);
  });

  // Small root and authorize endpoints to satisfy clients that probe the base URL
  app.get('/', (_req: Request, res: Response) => {
    res.json({ ok: true, name: 'mcp-abap-adt remote', version: '1.2.0' });
  });

  // MCP JSON-RPC HTTP transport handler for initialize and other requests
  app.post('/', (req: Request, res: Response) => {
    try {
      const { method, id, params } = req.body || {};

      if (method === 'initialize') {
        // Respond with MCP server capabilities
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              prompts: {},
              resources: {},
              logging: {}
            },
            serverInfo: {
              name: 'mcp-abap-adt',
              version: '1.2.0'
            }
          }
        };
        return res.json(response);
      }

      if (method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            tools: toolDefinitions.map(({ name, description, inputSchema }) => ({
              name, description, inputSchema
            }))
          }
        };
        return res.json(response);
      }

      if (method === 'tools/call') {
        // Handle tool calls similar to /call endpoint
        const toolName = params?.name;
        const args = params?.arguments || {};

        const tool = toolDefinitions.find(t => t.name === toolName);
        if (!tool) {
          return res.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${toolName}` }
          });
        }

        // Validate required parameters
        if (Array.isArray(tool.inputSchema?.required)) {
          for (const reqKey of tool.inputSchema.required) {
            if (args[reqKey] === undefined) {
              return res.json({
                jsonrpc: '2.0',
                id,
                error: { code: -32602, message: `Missing required parameter: ${reqKey}` }
              });
            }
          }
        }

        // Attempt all authentication methods to extract SAP user information
        const authInfo = extractAuthInfo(req);
        const enrichedArgs = {
          ...args,
          _sapUsername: authInfo?.username,
          _sapPassword: authInfo?.password
        };

        // Execute tool and return result
        tool.handler(enrichedArgs).then(result => {
          res.json({
            jsonrpc: '2.0',
            id,
            result
          });
        }).catch((err: any) => {
          res.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32603, message: err?.message || String(err) }
          });
        });
        return;
      }

      // Generic success for other methods
      res.json({
        jsonrpc: '2.0',
        id,
        result: { ok: true }
      });

    } catch (err: any) {
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id,
        error: { code: -32603, message: err?.message || String(err) }
      });
    }
  });

  // Some MCP clients open an /authorize path during auth flows; respond simply so they can continue
  app.get('/authorize', (_req: Request, res: Response) => {
    // Return a minimal HTML page so browser popups expecting an HTTP response don't show a generic 404
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('<!doctype html><html><head><title>MCP Authorize</title></head><body>Authorization complete. You may close this window.</body></html>');
  });

  // Small helper endpoint for manually emitting test events from HTTP (useful during dev).
  // Accepts JSON body { event: string, data: any, topic?: string }
  app.post('/emit', (req: Request, res: Response) => {
    if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { event, data, topic } = req.body || {};
    if (!event) return res.status(400).json({ error: 'Missing event name' });
    sendSseEvent(event, data === undefined ? null : data, topic);
    res.json({ ok: true, connected: getConnectedCount() });
  });

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`MCP remote server listening on http://localhost:${port}`);
      resolve();
    });
    server.on('error', (err: Error) => reject(err));

    // Keep the process alive by handling process signals
    process.on('SIGINT', () => {
      console.log('\nShutting down remote server...');
      server.close(() => {
        console.log('Remote server stopped');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\nShutting down remote server...');
      server.close(() => {
        console.log('Remote server stopped');
        process.exit(0);
      });
    });
  });
}
