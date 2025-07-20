#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import dotenv from 'dotenv';

// === 핸들러 import (파일명 대소문자 일치) ===
import { handle_DDIC_Structure } from './handlers/handle_DDIC_Structure.js';
import { handle_DDIC_TypeInfo } from './handlers/handle_DDIC_TypeInfo.js';
import { handle_DDIC_Table } from './handlers/handle_DDIC_Table.js';
import { handle_DDIC_CDS } from './handlers/handle_DDIC_CDS.js';
import { handle_DDIC_DataElements } from './handlers/handle_DDIC_DataElements.js';
import { handle_DDIC_Domains } from './handlers/handle_DDIC_Domains.js';
import { handleGetProgram } from './handlers/handle_Get_Program.js';
import { handleGetClass } from './handlers/handle_Get_Class.js';
import { handleGetFunction } from './handlers/handle_Get_Function.js';
import { handleGetFunctionGroup } from './handlers/handle_Get_FunctionGroup.js';
import { handleGetInterface } from './handlers/handle_Get_Interface.js';
import { handleGetInclude } from './handlers/handle_Get_Include.js';
import { handleGetPackage } from './handlers/handle_Get_Package.js';
import { handleGetTransaction } from './handlers/handle_Get_Transaction.js';
import { handleSearchObject } from './handlers/handle_SearchObject.js';
import { handleGetWhereUsed } from './handlers/handle_WhereUsed.js';

import { return_error, getBaseUrl, makeAdtRequest } from './lib/utils.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface SapConfig {
  url: string;
  username: string;
  password: string;
  client: string;
}

export { getBaseUrl, makeAdtRequest, return_error };

export function getConfig(): SapConfig {
  const url = process.env.SAP_URL;
  const username = process.env.SAP_USERNAME;
  const password = process.env.SAP_PASSWORD;
  const client = process.env.SAP_CLIENT;

  console.error('Configuration check:', {
    hasUrl: !!url,
    hasUsername: !!username,
    hasPassword: !!password,
    hasClient: !!client,
    url: url ? `${url.substring(0, 20)}...` : 'undefined'
  });

  if (!url || !username || !password || !client) {
    const missing: string[] = [];
    if (!url) missing.push('SAP_URL');
    if (!username) missing.push('SAP_USERNAME');
    if (!password) missing.push('SAP_PASSWORD');
    if (!client) missing.push('SAP_CLIENT');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return { url, username, password, client };
}

// === 툴 정의 및 핸들러 매핑 ===
const toolDefinitions = [
  {
    name: 'GetDDICStructure',
    description: '스트럭쳐 정의를 조회',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'DDIC structure name' } },
      required: ['object_name']
    },
    handler: handle_DDIC_Structure
  },
  {
    name: 'GetDDICTypeInfo',
    description: '타입 정보를 조회',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'DDIC type name' } },
      required: ['object_name']
    },
    handler: handle_DDIC_TypeInfo
  },
  {
    name: 'GetDDICTable',
    description: '테이블 정의를 조회',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'Table name' } },
      required: ['object_name']
    },
    handler: handle_DDIC_Table
  },
  {
    name: 'GetDDICCDS',
    description: 'CDS 뷰 정의를 조회',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'CDS view name' } },
      required: ['object_name']
    },
    handler: handle_DDIC_CDS
  },
  {
    name: 'GetDDICDataElement',
    description: '데이터 엘리먼트 정의를 조회',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'Data element name' } },
      required: ['object_name']
    },
    handler: handle_DDIC_DataElements
  },
  {
    name: 'GetDDICDomain',
    description: '도메인 정의를 조회',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'Domain name' } },
      required: ['object_name']
    },
    handler: handle_DDIC_Domains
  },
  {
    name: 'GetProgram',
    description: 'ABAP 프로그램 소스코드를 조회',
    inputSchema: {
      type: 'object',
      properties: { program_name: { type: 'string', description: 'Program name' } },
      required: ['program_name']
    },
    handler: handleGetProgram
  },
  {
    name: 'GetClass',
    description: 'ABAP 클래스 소스코드를 조회',
    inputSchema: {
      type: 'object',
      properties: { class_name: { type: 'string', description: 'Class name' } },
      required: ['class_name']
    },
    handler: handleGetClass
  },
  {
    name: 'GetFunction',
    description: 'ABAP 펑션 모듈 소스코드를 조회',
    inputSchema: {
      type: 'object',
      properties: {
        function_name: { type: 'string', description: 'Function module name' },
        function_group: { type: 'string', description: 'Function group name' }
      },
      required: ['function_name', 'function_group']
    },
    handler: handleGetFunction
  },
  {
    name: 'GetFunctionGroup',
    description: 'ABAP 펑션 그룹 소스코드를 조회',
    inputSchema: {
      type: 'object',
      properties: { function_group: { type: 'string', description: 'Function group name' } },
      required: ['function_group']
    },
    handler: handleGetFunctionGroup
  },
  {
    name: 'GetInterface',
    description: 'ABAP 인터페이스 소스코드를 조회',
    inputSchema: {
      type: 'object',
      properties: { interface_name: { type: 'string', description: 'Interface name' } },
      required: ['interface_name']
    },
    handler: handleGetInterface
  },
  {
    name: 'GetInclude',
    description: 'ABAP 인클루드 소스코드를 조회',
    inputSchema: {
      type: 'object',
      properties: { include_name: { type: 'string', description: 'Include name' } },
      required: ['include_name']
    },
    handler: handleGetInclude
  },
  {
    name: 'GetPackage',
    description: 'ABAP 패키지 상세 정보를 조회',
    inputSchema: {
      type: 'object',
      properties: { package_name: { type: 'string', description: 'Package name' } },
      required: ['package_name']
    },
    handler: handleGetPackage
  },
  {
    name: 'GetTransaction',
    description: 'ABAP 트랜잭션 상세 정보를 조회',
    inputSchema: {
      type: 'object',
      properties: { transaction_name: { type: 'string', description: 'Transaction name' } },
      required: ['transaction_name']
    },
    handler: handleGetTransaction
  },
  {
    name: 'SearchObject',
    description: 'ABAP 오브젝트를 검색',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        maxResults: { type: 'number', description: 'Max results', default: 100 }
      },
      required: ['query']
    },
    handler: handleSearchObject
  },
  {
    name: 'GetWhereUsed',
    description: 'ABAP 오브젝트의 참조 및 사용처를 조회',
    inputSchema: {
      type: 'object',
      properties: {
        object_name: { type: 'string', description: 'Object name' },
        object_type: { type: 'string', description: 'Object type' },
        max_results: { type: 'number', description: 'Max results', default: 100 }
      },
      required: ['object_name']
    },
    handler: handleGetWhereUsed
  }
];

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
        // 필수 파라미터 체크
        for (const reqKey of tool.inputSchema.required) {
          if (!request.params.arguments || request.params.arguments[reqKey] === undefined) {
            throw new McpError(ErrorCode.InvalidParams, `Missing required parameter: ${reqKey}`);
          }
        }
        // 타입 안전하게 handler 호출
        return await tool.handler(request.params.arguments as any);
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
