# MCP ABAP ADT Server

**MCP ABAP ADT Server** is a Model Context Protocol (MCP) server for ABAP Development Tools (ADT), providing unified access to SAP ABAP system metadata, source code, and runtime analysis. It exposes a rich set of APIs for DDIC inspection, ABAP object retrieval, trace/dump analysis, and repository search.

---

## ✨ Features

- **DDIC Inspection**: Structures, tables, CDS views, data elements, domains, and types.
- **ABAP Object Retrieval**: Programs, classes, function modules, function groups, includes, interfaces, message classes, packages, transactions.
- **Runtime Analysis**: ABAP trace listing and details, runtime dump listing and details.
- **Repository Search**: Object search (wildcard/regex), where-used analysis.
- **Extensible Tool Registry**: All APIs are defined in `src/toolDefinitions.ts` for easy extension and MCP client integration.

---

## 🚀 Getting Started

### Requirements

- Node.js 18+ (LTS recommended)
- SAP ABAP system with ADT service enabled and valid credentials

### Installation

```bash
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt
npm install
npm run build
cp .env.example .env
# Edit .env with your SAP connection details
```

### Environment Variables Example

```env
SAP_URL=https://your-sap-system.com:8000
SAP_USERNAME=your_username
SAP_PASSWORD=your_password
SAP_CLIENT=100
```

### Running the Server

```bash
npm run dev      # Development mode
npm start        # Production mode
npm test         # Run tests
```

---

## 🛠 Handler Architecture

All API endpoints are implemented as modular handler files in `src/handlers/`. The central registry, `src/toolDefinitions.ts`, maps each tool name to its handler, input schema, and description.

### Handler Overview

- **API_Releases**: Retrieve API release information for any ADT object.
- **DataPreview**: Preview ABAP data for a DDIC entity (table/view), with row limit.
- **GetDDIC_CDS**: Retrieve CDS view definition.
- **GetDDIC_DataElements**: Retrieve data element definition.
- **GetDDIC_Domains**: Retrieve domain definition.
- **GetDDIC_Structure**: Retrieve structure definition.
- **GetDDIC_Table**: Retrieve table definition.
- **GetDDIC_TypeInfo**: Retrieve DDIC type information.
- **Get_ABAPTraces**: List ABAP trace entries for a user, with filtering and result limit.
- **Get_ABAPTracesDetails**: Retrieve detailed trace data (DB accesses, hitlist, statements) for a trace ID.
- **Get_Class**: Retrieve ABAP class source code.
- **Get_Function**: Retrieve ABAP function module source code.
- **Get_FunctionGroup**: Retrieve ABAP function group source code.
- **Get_Include**: Retrieve ABAP include source code.
- **Get_Interface**: Retrieve ABAP interface source code.
- **Get_MessageClass**: Retrieve ABAP message class information.
- **Get_Package**: Retrieve ABAP package details.
- **Get_Program**: Retrieve ABAP program source code.
- **Get_Transaction**: Retrieve ABAP transaction details.
- **GetRuntimeDumpDetails**: Retrieve detailed ABAP runtime dump information.
- **GetRuntimeDumps**: Retrieve ABAP runtime dump list.
- **SearchObject**: Search for ABAP objects (wildcard/regex).
- **GetWhereUsed**: Retrieve references and usage locations for an ABAP object.

Each handler validates input, constructs the appropriate ADT API request, and returns standardized responses or error objects.

---

## 📖 API Reference

All APIs are accessible via MCP clients using the tool names defined in `toolDefinitions.ts`. Input validation and error handling are automatic.

### Example Tool Usage

```bash
# Retrieve class source code
@tool Get_Class class_name=CL_HTTP_CLIENT

# Analyze table structure
@tool GetDDIC_Table object_name=SFLIGHT

# Preview table data
@tool DataPreview ddicEntityName=SFLIGHT rowNumber=10

# Search for objects
@tool SearchObject query=CL_HTTP* maxResults=10

# Where-used analysis
@tool GetWhereUsed object_name=MATNR object_type=DATA_ELEMENT
```

See `src/toolDefinitions.ts` for the full list of supported tools and their input schemas.

---

## 🔧 MCP Client Integration

### VS Code

- Install the MCP Extension.
- Add server configuration to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "abap-adt": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/mcp-abap-adt"
    }
  }
}
```

### Claude Desktop & Eclipse Copilot

- See the README for configuration examples for Claude Desktop and Eclipse Copilot.

---

## 🛠 Troubleshooting

| Issue                  | Solution                                      |
|------------------------|-----------------------------------------------|
| Build failure          | `rm -rf node_modules && npm install`          |
| SAP connection error   | Check `.env` settings, network/firewall       |
| ADT service unavailable| Ensure `/sap/bc/adt` is enabled on SAP        |
| MCP client connection  | Use absolute paths, check execution rights    |

Enable debug logging with:

```bash
DEBUG=mcp-abap-adt:*
LOG_LEVEL=debug
```

---

## 🤝 Contributing

- Report bugs and suggestions via GitHub Issues.
- Propose new APIs or features.
- Submit code improvements via Pull Requests.
- Help improve documentation.

### Development Setup

```bash
npm install --include=dev
npm run lint
npm run test:unit
npm run test:integration
```

---

## 📄 License

MIT License – Free to use, modify, and distribute.

---

**Experience next-generation ABAP development with MCP ABAP ADT Server! 🚀**
