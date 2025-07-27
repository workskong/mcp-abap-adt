import * as handlers from './handlers/index';

export const toolDefinitions = [
  // API_Releases
  {
    name: 'API_Releases',
    description: 'ADT 오브젝트의 API Release 정보를 조회',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'ADT 오브젝트 검색 쿼리(예: SBOOK, C_GREGORIANCALSGLDATEFUNCVH 등)' } },
      required: ['query']
    },
    handler: handlers.handle_API_Releases.handle_API_Releases
  },
  // DataPreview
  {
    name: 'DataPreview',
    description: 'ABAP 데이터 프리뷰 조회',
    inputSchema: {
      type: 'object',
      properties: {
        ddicEntityName: { type: 'string', description: 'DDIC 엔티티명' },
        rowNumber: { type: 'number', description: '조회 행 수', default: 100 }
      },
      required: ['ddicEntityName']
    },
    handler: handlers.handle_DataPreview.handle_DataPreview
  },
  // DDIC_CDS
  {
    name: 'GetDDIC_CDS',
    description: 'CDS 뷰 정의를 조회',
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
    description: '데이터 엘리먼트 정의를 조회',
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
    description: '도메인 정의를 조회',
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
    description: '스트럭쳐 정의를 조회',
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
    description: '테이블 정의를 조회',
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
    description: '타입 정보를 조회',
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
    description: 'ABAP Trace (성능) 정보를 조회',
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
    description: 'ABAP Trace 상세 정보를 조회',
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
    description: 'ABAP 클래스 소스코드를 조회',
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
    description: 'ABAP 펑션 모듈 소스코드를 조회',
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
    description: 'ABAP 펑션 그룹 소스코드를 조회',
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
    description: 'ABAP 인클루드 소스코드를 조회',
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
    description: 'ABAP 인터페이스 소스코드를 조회',
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
    description: 'ABAP 메시지 클래스 정보를 조회',
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
    description: 'ABAP 패키지 상세 정보를 조회',
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
    description: 'ABAP 프로그램 소스코드를 조회',
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
    description: 'ABAP 트랜잭션 상세 정보를 조회',
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
    description: 'ABAP 런타임 덤프 상세 정보를 조회',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '런타임 덤프 id(알려진 경우)' }
      },
      required: ['id']
    },
    handler: handlers.handle_RuntimeDumpDetails.handle_RuntimeDumpDetails
  },
  // RuntimeDumps
  {
    name: 'GetRuntimeDumps',
    description: 'ABAP 런타임 덤프 리스트를 조회',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: '시작 날짜(YYYY-MM-DD 또는 YYYYMMDD)' },
        end_date: { type: 'string', description: '종료 날짜(YYYY-MM-DD 또는 YYYYMMDD)' },
        start_time: { type: 'string', description: '시작 시간(00:00:00 또는 000000, 기본값 000000)' },
        end_time: { type: 'string', description: '종료 시간(00:00:00 또는 235959, 기본값 235959)' },
        category: { type: 'string', description: '카테고리 필터링' },
        maxResults: { type: 'number', description: '최대 결과 수', default: 5 }
      },
      required: ['start_date']
    },
    handler: handlers.handle_RuntimeDumps.handle_RuntimeDumps
  },
  // SearchObject
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
    handler: handlers.handle_SearchObject.handleSearchObject
  },
  // GetWhereUsed
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
    handler: handlers.handle_WhereUsed.handleGetWhereUsed
  }
];
