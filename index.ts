#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getConfig, return_error, type SapConfig } from './src/lib/utils';
import { toolDefinitions } from './src/toolDefinitions';

// === MCP 서버 클래스 ===
export class mcp_abap_adt_server {
  private server: Server;
  private sapConfig: SapConfig;

  constructor() {
    this.sapConfig = getConfig();
    this.server = new Server(
      { name: 'mcp-abap-adt', version: '1.1.1' },
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
        // 필수 파라미터 체크 (required만 지원)
        const args = request.params.arguments || {};
        if (Array.isArray(tool.inputSchema.required)) {
          for (const reqKey of tool.inputSchema.required) {
            if (args[reqKey] === undefined) {
              throw new McpError(ErrorCode.InvalidParams, `Missing required parameter: ${reqKey}`);
            }
          }
        }
        // 타입 안전하게 handler 호출
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
server.run().catch(() => process.exit(1));
