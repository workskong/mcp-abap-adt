
import * as handlers from './handlers/index';

// All handler descriptions and comments are translated to English below
export const toolDefinitions = [
  // API_Releases
  {
    name: 'API_Releases',
    description: 'Retrieve API Release information for an ADT object',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'ADT object search query (e.g. SBOOK, C_GREGORIANCALSGLDATEFUNCVH)' } },
      required: ['query']
    },
    handler: handlers.handle_API_Releases.handle_API_Releases
  },
  // DataPreview
  {
    name: 'DataPreview',
    description: 'Preview ABAP data for a DDIC entity',
    inputSchema: {
      type: 'object',
      properties: {
        ddicEntityName: { type: 'string', description: 'DDIC entity name' },
        rowNumber: { type: 'number', description: 'Number of rows to retrieve', default: 100 }
      },
      required: ['ddicEntityName']
    },
    handler: handlers.handle_DataPreview.handle_DataPreview
  },
  // DDIC_CDS
  {
    name: 'GetDDIC_CDS',
    description: 'Retrieve CDS view definition',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'CDS view name' } },
      required: ['object_name']
    },
    handler: handlers.handle_DDIC_CDS.handle_DDIC_CDS
  },
  // DDIC_DataElements
  {
    name: 'GetDDIC_DataElements',
    description: 'Retrieve data element definition',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'Data element name' } },
      required: ['object_name']
    },
    handler: handlers.handle_DDIC_DataElements.handle_DDIC_DataElements
  },
  // DDIC_Domains
  {
    name: 'GetDDIC_Domains',
    description: 'Retrieve domain definition',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'Domain name' } },
      required: ['object_name']
    },
    handler: handlers.handle_DDIC_Domains.handle_DDIC_Domains
  },
  // DDIC_Structure
  {
    name: 'GetDDIC_Structure',
    description: 'Retrieve structure definition',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'DDIC structure name' } },
      required: ['object_name']
    },
    handler: handlers.handle_DDIC_Structure.handle_DDIC_Structure
  },
  // DDIC_Table
  {
    name: 'GetDDIC_Table',
    description: 'Retrieve table definition',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'Table name' } },
      required: ['object_name']
    },
    handler: handlers.handle_DDIC_Table.handle_DDIC_Table
  },
  // DDIC_TypeInfo
  {
    name: 'GetDDIC_TypeInfo',
    description: 'Retrieve DDIC type information',
    inputSchema: {
      type: 'object',
      properties: { object_name: { type: 'string', description: 'DDIC type name' } },
      required: ['object_name']
    },
    handler: handlers.handle_DDIC_TypeInfo.handle_DDIC_TypeInfo
  },
  // Get_ABAPTraces
  {
    name: 'Get_ABAPTraces',
    description: 'Retrieve ABAP Trace (performance) information',
    inputSchema: {
      type: 'object',
      properties: {
        user: { type: 'string', description: 'User ID', default: 'DEV00' },
        maxResults: { type: 'number', description: 'Max results', default: 5 },
        objectNameFilter: { type: 'string', description: 'Object name filter' }
      },
      required: ['user']
    },
    handler: handlers.handle_Get_ABAPTraces.Get_ABAPTraces
  },
  // Get_ABAPTracesDetails
  {
    name: 'Get_ABAPTracesDetails',
    description: 'Retrieve detailed ABAP Trace information',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Trace id' },
        type: { type: 'string', description: 'Trace type (dbAccesses, hitlist, statements)' }
      },
      required: ['id', 'type']
    },
    handler: handlers.handle_Get_ABAPTracesDetails.handle_Get_ABAPTracesDetails
  },
  // Get_Class
  {
    name: 'Get_Class',
    description: 'Retrieve ABAP class source code',
    inputSchema: {
      type: 'object',
      properties: { class_name: { type: 'string', description: 'Class name' } },
      required: ['class_name']
    },
    handler: handlers.handle_Get_Class.handleGetClass
  },
  // Get_Function
  {
    name: 'Get_Function',
    description: 'Retrieve ABAP function module source code',
    inputSchema: {
      type: 'object',
      properties: {
        function_name: { type: 'string', description: 'Function module name' },
        function_group: { type: 'string', description: 'Function group name' }
      },
      required: ['function_name', 'function_group']
    },
    handler: handlers.handle_Get_Function.handleGetFunction
  },
  // Get_FunctionGroup
  {
    name: 'Get_FunctionGroup',
    description: 'Retrieve ABAP function group source code',
    inputSchema: {
      type: 'object',
      properties: { function_group: { type: 'string', description: 'Function group name' } },
      required: ['function_group']
    },
    handler: handlers.handle_Get_FunctionGroup.handleGetFunctionGroup
  },
  // Get_Include
  {
    name: 'Get_Include',
    description: 'Retrieve ABAP include source code',
    inputSchema: {
      type: 'object',
      properties: { include_name: { type: 'string', description: 'Include name' } },
      required: ['include_name']
    },
    handler: handlers.handle_Get_Include.handleGetInclude
  },
  // Get_Interface
  {
    name: 'Get_Interface',
    description: 'Retrieve ABAP interface source code',
    inputSchema: {
      type: 'object',
      properties: { interface_name: { type: 'string', description: 'Interface name' } },
      required: ['interface_name']
    },
    handler: handlers.handle_Get_Interface.handleGetInterface
  },
  // Get_MessageClass
  {
    name: 'Get_MessageClass',
    description: 'Retrieve ABAP message class information',
    inputSchema: {
      type: 'object',
      properties: { MessageClass: { type: 'string', description: 'Message class name' } },
      required: ['MessageClass']
    },
    handler: handlers.handle_Get_MessageClass.handle_Get_MessageClass
  },
  // Get_Package
  {
    name: 'Get_Package',
    description: 'Retrieve ABAP package details',
    inputSchema: {
      type: 'object',
      properties: { package_name: { type: 'string', description: 'Package name' } },
      required: ['package_name']
    },
    handler: handlers.handle_Get_Package.handleGetPackage
  },
  // Get_Program
  {
    name: 'Get_Program',
    description: 'Retrieve ABAP program source code',
    inputSchema: {
      type: 'object',
      properties: { program_name: { type: 'string', description: 'Program name' } },
      required: ['program_name']
    },
    handler: handlers.handle_Get_Program.handleGetProgram
  },
  // Get_Transaction
  {
    name: 'Get_Transaction',
    description: 'Retrieve ABAP transaction details',
    inputSchema: {
      type: 'object',
      properties: { transaction_name: { type: 'string', description: 'Transaction name' } },
      required: ['transaction_name']
    },
    handler: handlers.handle_Get_Transaction.handleGetTransaction
  },
  // RuntimeDumpDetails
  {
    name: 'GetRuntimeDumpDetails',
    description: 'Retrieve detailed ABAP runtime dump information',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Runtime dump id (if known)' }
      },
      required: ['id']
    },
    handler: handlers.handle_RuntimeDumpDetails.handle_RuntimeDumpDetails
  },
  // RuntimeDumps
  {
    name: 'GetRuntimeDumps',
    description: 'Retrieve ABAP runtime dump list',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD or YYYYMMDD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD or YYYYMMDD)' },
        start_time: { type: 'string', description: 'Start time (00:00:00 or 000000, default 000000)' },
        end_time: { type: 'string', description: 'End time (00:00:00 or 235959, default 235959)' },
        category: { type: 'string', description: 'Category filter' },
        maxResults: { type: 'number', description: 'Max results', default: 5 }
      },
      required: ['start_date']
    },
    handler: handlers.handle_RuntimeDumps.handle_RuntimeDumps
  },
  // SearchObject
  {
    name: 'SearchObject',
    description: 'Search for ABAP objects',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        maxResults: { type: 'number', description: 'Max results', default: 100 }
      },
      required: ['query']
    },
    handler: handlers.handle_SearchObject.handleSearchObject
  }
];
