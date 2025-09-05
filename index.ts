#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { return_error, type SapConfig } from './src/lib/utils';
import { toolDefinitions } from './src/lib/toolDefinitions';

// === MCP server class ===
export class mcp_abap_adt_server {
  private server: Server;
  private sapConfig?: SapConfig;

  constructor() {
  this.server = new Server(
      { name: 'mcp-abap-adt', version: '1.2.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  private setupHandlers() {
    // ListToolsRequest
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolDefinitions.map(({ name, description, inputSchema }) => ({
        name, description, inputSchema
      }))
    }));

    // CallToolRequest
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const tool = toolDefinitions.find(t => t.name === request.params.name);
        if (!tool) {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
  // Check required parameters (only 'required' supported)
        const args = request.params.arguments || {};
        if (Array.isArray(tool.inputSchema.required)) {
          for (const reqKey of tool.inputSchema.required) {
            if (args[reqKey] === undefined) {
              throw new McpError(ErrorCode.InvalidParams, `Missing required parameter: ${reqKey}`);
            }
          }
        }
  // Call handler with type safety
        return await tool.handler(args as any);
      } catch (error) {
        return return_error(error);
      }
    });

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new mcp_abap_adt_server();
// If started with --remote, run an HTTP wrapper that exposes the tools over HTTP
if (process.argv.includes('--remote')) {
  // lazy import to avoid pulling Express when not needed
  import('./src/lib/remoteServer.js').then(mod => {
    mod.startRemoteServer(toolDefinitions).then(() => {
      // Keep the process alive for remote server mode
      console.log('Remote server started successfully. Press Ctrl+C to stop.');
    }).catch((err: any) => {
      // keep error formatting consistent with return_error
      // eslint-disable-next-line no-console
      console.error('Failed to start remote server:', err && err.message ? err.message : err);
      process.exit(1);
    });
  }).catch(err => {
    // eslint-disable-next-line no-console
    console.error('Failed to load remote server module:', err);
    process.exit(1);
  });
} else {
  server.run().catch((err: any) => {
    // Log the error so failures during startup/connect are visible to callers.
    // Previously the error was swallowed which can cause the client to wait for `initialize`.
    // Keep exit behavior but surface the underlying issue.
    // eslint-disable-next-line no-console
    console.error('Failed to start MCP server:', err && err.message ? err.message : err);
    process.exit(1);
  });
}
