#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import dotenv from 'dotenv';

// Import handler functions
import { handleGetProgram } from './handlers/handleGetProgram';
import { handleGetClass } from './handlers/handleGetClass';
import { handleGetWhereUsed } from './handlers/handleGetWhereUsed';
import { handleGetFunctionGroup } from './handlers/handleGetFunctionGroup';
import { handleGetFunction } from './handlers/handleGetFunction';
import { handleGetTable } from './handlers/handleGetTable';
import { handleGetStructure } from './handlers/handleGetStructure';
import { handleGetTableContents } from './handlers/handleGetTableContents';
import { handleGetPackage } from './handlers/handleGetPackage';
import { handleGetInclude } from './handlers/handleGetInclude';
import { handleGetTypeInfo } from './handlers/handleGetTypeInfo';
import { handleGetInterface } from './handlers/handleGetInterface';
import { handleGetTransaction } from './handlers/handleGetTransaction';
import { handleSearchObject } from './handlers/handleSearchObject';
import { handleGetCDS } from './handlers/handleGetCDS';

// Import shared utility functions and types
import { getBaseUrl, getAuthHeaders, createAxiosInstance, makeAdtRequest, return_error, return_response } from './lib/utils';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Interface for SAP configuration
export interface SapConfig {
  url: string;
  username: string;
  password: string;
  client: string;
}

/**
 * Retrieves SAP configuration from environment variables.
 *
 * @returns {SapConfig} The SAP configuration object.
 * @throws {Error} If any required environment variable is missing.
 */
export function getConfig(): SapConfig {
  const url = process.env.SAP_URL;
  const username = process.env.SAP_USERNAME;
  const password = process.env.SAP_PASSWORD;
  const client = process.env.SAP_CLIENT;

  // Check if all required environment variables are set
  if (!url || !username || !password || !client) {
    throw new Error(`Missing required environment variables. Required variables:
- SAP_URL
- SAP_USERNAME
- SAP_PASSWORD
- SAP_CLIENT`);
  }

  return { url, username, password, client };
}

/**
 * Server class for interacting with ABAP systems via ADT.
 */
export class mcp_abap_adt_server {
  private server: Server;  // Instance of the MCP server
  private sapConfig: SapConfig; // SAP configuration

  /**
   * Constructor for the mcp_abap_adt_server class.
   */
  constructor() {
    this.sapConfig = getConfig(); // Load SAP configuration
    this.server = new Server(  // Initialize the MCP server
      {
        name: 'mcp-abap-adt', // Server name
        version: '1.1.1',       // Server version
      },
      {
        capabilities: {
          tools: {}, // Initially, no tools are registered
        },
      }
    );

    this.setupHandlers(); // Setup request handlers
  }

  /**
   * Sets up request handlers for listing and calling tools.
   * @private
   */
  private setupHandlers() {
    // Handler for ListToolsRequest
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'GetProgram',
            description: 'Retrieve ABAP program source code with metadata including description, object name, and type',
            inputSchema: {
              type: 'object',
              properties: {
                program_name: {
                  type: 'string',
                  description: 'Name of the ABAP program to retrieve (e.g., "RSABAPPROGRAM", "ZMY_PROGRAM")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['program_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetClass',
            description: 'Retrieve ABAP class source code and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                class_name: {
                  type: 'string',
                  description: 'Name of the ABAP class to retrieve (e.g., "CL_WB_PGEDITOR_INITIAL_SCREEN", "ZCL_MY_CLASS")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['class_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetInterface',
            description: 'Retrieve ABAP interface source code and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                interface_name: {
                  type: 'string',
                  description: 'Name of the ABAP interface to retrieve (e.g., "ZIF_MY_INTERFACE", "IF_OO_ADT_CLASSRUN")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['interface_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetFunction',
            description: 'Retrieve ABAP function module source code with metadata including description, object name, and type. Function group will be auto-detected if not provided.',
            inputSchema: {
              type: 'object',
              properties: {
                function_name: {
                  type: 'string',
                  description: 'Name of the function module to retrieve (e.g., "RFC_READ_TABLE", "ZMY_FUNCTION")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                },
                function_group: {
                  type: 'string',
                  description: 'Name of the function group containing the function module (optional - will be auto-detected if not provided) (e.g., "RFC1", "ZFG")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 26
                }
              },
              required: ['function_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetFunctionGroup',
            description: 'Retrieve ABAP function group source code',
            inputSchema: {
              type: 'object',
              properties: {
                function_group: {
                  type: 'string',
                  description: 'Name of the function group to retrieve (e.g., "WBABAP", "ZFG")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 26
                }
              },
              required: ['function_group'],
              additionalProperties: false
            }
          },
          {
            name: 'GetTable',
            description: 'Retrieve ABAP table structure definition',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Name of the ABAP table to retrieve (e.g., "SBOOK", "ZMY_TABLE")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 16
                }
              },
              required: ['table_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetTableContents',
            description: 'Retrieve contents of an ABAP table (requires custom service implementation)',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Name of the ABAP table to retrieve contents from (e.g., "SBOOK", "ZMY_TABLE")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 16
                },
                max_rows: {
                  type: 'number',
                  description: 'Maximum number of rows to retrieve from the table',
                  minimum: 1,
                  maximum: 1000,
                  default: 100
                }
              },
              required: ['table_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetStructure',
            description: 'Retrieve ABAP structure definition',
            inputSchema: {
              type: 'object',
              properties: {
                structure_name: {
                  type: 'string',
                  description: 'Name of the ABAP structure to retrieve (e.g., "ZMY_STRUCT", "BAPIRET2")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['structure_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetInclude',
            description: 'Retrieve ABAP include program source code',
            inputSchema: {
              type: 'object',
              properties: {
                include_name: {
                  type: 'string',
                  description: 'Name of the ABAP include program to retrieve (e.g., "ZMY_INCLUDE", "LCL_ABAP")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['include_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetTypeInfo',
            description: 'Retrieve ABAP type information (domain or data element)',
            inputSchema: {
              type: 'object',
              properties: {
                type_name: {
                  type: 'string',
                  description: 'Name of the ABAP type to retrieve (domain or data element) (e.g., "ZMY_TYPE", "CHAR10")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['type_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetPackage',
            description: 'Retrieve ABAP package details and contents with object descriptions',
            inputSchema: {
              type: 'object',
              properties: {
                package_name: {
                  type: 'string',
                  description: 'Name of the ABAP package to retrieve (e.g., "ZMY_PACKAGE", "$TMP")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['package_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetTransaction',
            description: 'Retrieve ABAP transaction details and properties',
            inputSchema: {
              type: 'object',
              properties: {
                transaction_name: {
                  type: 'string',
                  description: 'Name of the ABAP transaction to retrieve (e.g., "SE80", "ZMY_TRANSACTION")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 20
                }
              },
              required: ['transaction_name'],
              additionalProperties: false
            }
          },
          {
            name: 'GetCds',
            description: 'Retrieve CDS view source code with package information and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                cds_name: {
                  type: 'string',
                  description: 'Name of the CDS view to retrieve (e.g., "I_Currency", "ZMY_CDSVIEW")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                }
              },
              required: ['cds_name'],
              additionalProperties: false
            }
          },
          {
            name: 'SearchObject',
            description: 'Search for ABAP objects using quick search functionality',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query string to find ABAP objects (supports wildcards like *) (e.g., "ZMY*", "CL_*")',
                  minLength: 1,
                  maxLength: 100
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of search results to return',
                  minimum: 1,
                  maximum: 1000,
                  default: 100
                }
              },
              required: ['query'],
              additionalProperties: false
            }
          },
          {
            name: 'GetWhereUsed',
            description: 'Find references and usages of ABAP objects across the system',
            inputSchema: {
              type: 'object',
              properties: {
                object_name: {
                  type: 'string',
                  description: 'Name of the ABAP object to find references for (e.g., "ZCL_MY_CLASS", "SBOOK")',
                  pattern: '^[A-Z][A-Z0-9_]*$',
                  minLength: 1,
                  maxLength: 30
                },
                object_type: {
                  type: 'string',
                  description: 'Type of the ABAP object to search for references',
                  enum: [
                    'CLASS', 'INTERFACE', 'PROGRAM', 'FUNCTION', 'TABLE', 'STRUCTURE',
                    'REPORT', 'INCLUDE', 'TYPE', 'DOMAIN', 'DATA_ELEMENT', 'VIEW',
                    'SEARCH_HELP', 'LOCK_OBJECT', 'TRANSFORMATION', 'ENHANCEMENT',
                    'PACKAGE', 'TRANSPORT', 'FORM', 'METHOD', 'ATTRIBUTE', 'CONSTANT',
                    'VARIABLE', 'PARAMETER', 'SELECT_OPTION', 'FIELD_SYMBOL', 'DATA',
                    'CDS_VIEW', 'AMDP', 'DDIC_OBJECT', 'AUTHORIZATION_OBJECT', 'NUMBER_RANGE'
                  ],
                  default: 'CLASS'
                },
                max_results: {
                  type: 'number',
                  description: 'Maximum number of reference results to return',
                  minimum: 1,
                  maximum: 1000,
                  default: 100
                }
              },
              required: ['object_name'],
              additionalProperties: false
            }
          }
        ]
      };
    });

    // Handler for CallToolRequest
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'GetProgram':
            return await handleGetProgram(request.params.arguments);
          case 'GetClass':
            return await handleGetClass(request.params.arguments as any);
          case 'GetInterface':
            return await handleGetInterface(request.params.arguments);
          case 'GetFunction':
            return await handleGetFunction(request.params.arguments);
          case 'GetFunctionGroup':
            return await handleGetFunctionGroup(request.params.arguments);
          case 'GetTable':
            return await handleGetTable(request.params.arguments);
          case 'GetTableContents':
            return await handleGetTableContents(request.params.arguments);
          case 'GetStructure':
            return await handleGetStructure(request.params.arguments);
          case 'GetInclude':
            return await handleGetInclude(request.params.arguments);
          case 'GetTypeInfo':
            return await handleGetTypeInfo(request.params.arguments);
          case 'GetPackage':
            return await handleGetPackage(request.params.arguments);
          case 'GetTransaction':
            return await handleGetTransaction(request.params.arguments);
          case 'GetCds':
            return await handleGetCDS(request.params.arguments as any);
          case 'SearchObject':
            return await handleSearchObject(request.params.arguments);
          case 'GetWhereUsed':
            return await handleGetWhereUsed(request.params.arguments as any);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}. Available tools: GetProgram, GetClass, GetInterface, GetFunction, GetFunctionGroup, GetTable, GetTableContents, GetStructure, GetInclude, GetTypeInfo, GetPackage, GetTransaction, GetCds, SearchObject, GetWhereUsed`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        return return_error(error);
      }
    });

    // Handle server shutdown on SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Starts the MCP server and connects it to the transport.
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Create and run the server
const server = new mcp_abap_adt_server();
server.run().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
