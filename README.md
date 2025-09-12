# mcp-abap-adt

**MCP Server for SAP ABAP ADT** - A lightweight Model Context Protocol (MCP) adapter that provides unified access to SAP ABAP metadata, source code, and diagnostics through ADT (ABAP Development Tools) services.

[![Version](https://img.shields.io/badge/version-1.3.3-blue)](https://github.com/workskong/mcp-abap-adt)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

- 🔍 **ABAP Object Search** - Search across classes, programs, interfaces, and more
- 📖 **Source Code Retrieval** - Access ABAP classes, programs, function modules, includes
- 🗂️ **DDIC Metadata** - Retrieve table structures, CDS views, data elements, domains
- 📊 **Data Preview** - Preview actual data from DDIC entities
- 🔧 **Runtime Diagnostics** - Access ABAP traces and runtime dump analysis
- 🚀 **Dual Mode Support** - stdio (MCP standard) and HTTP/SSE for web clients
- 🐳 **Docker Ready** - Production-ready containerization
- 🔐 **Flexible Authentication** - Basic Auth, header-based, or environment variables

## 🏃 Quick Start

### Prerequisites
- **Node.js** ≥ 18 (Node.js 22 LTS recommended for production)
- **npm** (comes with Node.js)
- **TypeScript** (installed via devDependencies)
- **SAP System** with ADT services enabled

### 🚀 Installation & Setup

```powershell
# Clone the repository
git clone https://github.com/workskong/mcp-abap-adt.git
cd mcp-abap-adt

# Install dependencies
npm ci

# Build the TypeScript code
npm run build

# Copy environment template (optional)
cp .env.example .env
```

### Running the Server

#### 📡 MCP Mode (stdio) - Default
```powershell
npm start
```
This runs the server in MCP standard mode over stdio, suitable for MCP clients and inspectors.

#### 🌐 HTTP/SSE Mode (remote)
```powershell
# Set required environment variable
$env:PORT = '6969'

# Start HTTP server with SSE support
npm run start-remote
```
Remote mode exposes HTTP endpoints and Server-Sent Events for web-based clients.

#### 🔍 Development Mode
```powershell
npm run dev
```
Runs with the MCP inspector for debugging and development.

---

## 🌐 Remote HTTP Endpoints

When running in HTTP/SSE mode (`--remote`), the following endpoints are available:

| Method | Endpoint | Description | Content-Type |
|--------|----------|-------------|--------------|
| 🟢 GET    | `/`      | Server status and health information | `application/json` |
| 📋 GET    | `/tools` | List all available tools with schemas | `application/json` |
| 🔧 POST   | `/call`  | Execute a tool by name | `application/json` |
| 📡 GET    | `/events`| Server-Sent Events stream for real-time updates | `text/event-stream` |
| 🧪 POST   | `/emit`  | Emit test SSE event (development only) | `application/json` |
| 🔌 POST   | `/`      | Alternative MCP JSON-RPC endpoint | `application/json` |

### 🔐 Authentication Options

The server supports multiple authentication methods:

1. **Basic Authentication** - Standard HTTP Basic Auth header
2. **Custom Headers** - Use `X-Username`/`X-Password` for general auth
3. **SAP Headers** - Use `X-SAP_USERNAME`/`X-SAP_PASSWORD` for SAP-specific auth
4. **Environment Variables** - Set credentials via environment (stdio mode)

***

## 🔌 MCP Client Config Examples

Below are examples for MCP clients (VS Code, Eclipse). Preserve your actual credentials; the examples use placeholders.

### VS Code

#### Remote (HTTP/SSE)
```json
{
  "inputs": [
    { "id": "SAP_USERNAME", "type": "promptString", "description": "SAP Username", "password": false },
    { "id": "SAP_PASSWORD", "type": "promptString", "description": "SAP Password", "password": true },
    { "id": "SAP_CLIENT", "type": "promptString", "description": "SAP Client", "password": false },
    { "id": "SAP_LANGUAGE", "type": "promptString", "description": "SAP Language", "password": false },
    { "id": "SAP_URL", "type": "promptString", "description": "SAP URL", "password": false }
  ],
  "servers": {
    "mcp-abap-adt": {
      "type": "sse",
      "url": "http://localhost:6969",
      "headers": {
        "X-SAP_USERNAME": "${input:SAP_USERNAME}",
        "X-SAP_PASSWORD": "${input:SAP_PASSWORD}",
        "X-SAP_CLIENT": "${input:SAP_CLIENT}",
        "X-SAP_LANGUAGE": "${input:SAP_LANGUAGE}",
        "X-SAP_URL": "${input:SAP_URL}"
      }
    }
  }
}
```

#### Local (stdio)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "type": "stdio",
      "command": "node",
      "cwd": "C:/Users/{...}/Documents/mcp-abap-adt",
      "args": [
        "C:/Users/{...}/Documents/mcp-abap-adt/dist/index.js"
      ],
      "env": {
        "SAP_USERNAME": "DEV00",
        "SAP_PASSWORD": "XXXX",
        "SAP_CLIENT": "001",
        "SAP_LANGUAGE": "EN",
        "SAP_URL": "http://your-sap-server:50000"
      }
    }
  }
}
```

These snippets show either SSE over HTTP (remote) or launching the server as a child process and communicating over stdio (local). Ensure `dist/index.js` exists after building.

### Eclipse

#### Remote (HTTP/SSE)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "url": "http://localhost:6969",
      "requestInit": {
        "headers": {
          "X-SAP_USERNAME": "DEV00",
          "X-SAP_PASSWORD": "XXXX",
          "X-SAP_CLIENT": "001",
          "X-SAP_LANGUAGE": "EN",
          "X-SAP_URL": "http://your-sap-server:50000"
        }
      }
    }
  }
}
```

#### Local (stdio)
```json
{
  "servers": {
    "mcp-abap-adt": {
      "type": "stdio",
      "command": "node",
      "cwd": "C:/Users/{...}/Documents/mcp-abap-adt",
      "args": [
        "C:/Users/{...}/Documents/mcp-abap-adt/dist/index.js"
      ],
      "env": {
        "SAP_USERNAME": "DEV00",
        "SAP_PASSWORD": "XXXX",
        "SAP_CLIENT": "001",
        "SAP_LANGUAGE": "EN",
        "SAP_URL": "http://your-sap-server:50000"
      }
    }
  }
}
```
Eclipse can either connect to the remote HTTP wrapper or spawn the server and communicate via stdio.

Notes:
- Remote mode requires starting the server with `--remote` and a `PORT` (for example, 6969) before clients connect.
- For stdio mode, ensure the TypeScript build produced `dist/index.js` and that Node.js 18+ is available in PATH.

***

## 🐳 Docker Deployment

### 🏗️ Build the Image
```bash
docker build -t mcp-abap-adt:latest .
```

### 🚀 Run the Container

**Basic HTTP/SSE mode:**
```bash
docker run --rm \
  -e PORT=6969 \
  -e TLS_REJECT_UNAUTHORIZED=0 \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

**With SAP connection:**
```bash
docker run --rm \
  -e PORT=6969 \
  -e SAP_URL="http://your-sap-server:50000" \
  -e TLS_REJECT_UNAUTHORIZED=0 \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

**Using environment file:**
```bash
docker run --rm \
  --env-file .env \
  -p 6969:6969 \
  mcp-abap-adt:latest
```

### 🔍 Container Health Check
The Docker image includes an automated health check that monitors the server status. The container will report healthy once the server is ready to accept connections.

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes (remote mode) | `6969` | TCP port for HTTP server |
| `NODE_ENV` | No | `production` | Environment mode (`production`, `development`) |
| `TLS_REJECT_UNAUTHORIZED` | No | `0` | TLS certificate validation (0=disabled, 1=enabled) |
| `SAP_URL` | Yes | - | SAP ABAP server URL with ADT services |
| `SAP_USERNAME` | No | - | SAP username (fallback when not provided via function parameters) |
| `SAP_PASSWORD` | No | - | SAP password (fallback when not provided via function parameters) |
| `SAP_CLIENT` | No | - | SAP client number (fallback when not provided via function parameters) |
| `SAP_LANGUAGE` | No | `EN` | Default SAP language (fallback when not provided via function parameters) |

### 🔧 Setting Environment Variables

**Windows PowerShell:**
```powershell
$env:PORT = "6969"
$env:SAP_URL = "https://your-sap-server.company.com:8000"
$env:SAP_USERNAME = "your_username"
$env:SAP_PASSWORD = "your_password"
$env:SAP_CLIENT = "100"
$env:SAP_LANGUAGE = "EN"
$env:TLS_REJECT_UNAUTHORIZED = "0"
```

**Linux/macOS:**
```bash
export PORT=6969
export SAP_URL="https://your-sap-server.company.com:8000"
export SAP_USERNAME="your_username"
export SAP_PASSWORD="your_password"
export SAP_CLIENT="100"
export SAP_LANGUAGE="EN"
export TLS_REJECT_UNAUTHORIZED=0
```

**Using .env file:**
```bash
cp .env.example .env
# Edit .env with your SAP connection details
```

### 🔐 Authentication Priority

The server supports multiple authentication methods with the following priority:

1. **Function Parameters** - Highest priority (directly passed to each tool call)
2. **Environment Variables** - Fallback when function parameters are empty
3. **Headers** - Used by remote HTTP mode for per-request authentication

When SAP authentication parameters (`_sapUsername`, `_sapPassword`, `_sapClient`, `_sapLanguage`) are not provided in function calls, the server automatically falls back to environment variables. This allows for flexible deployment scenarios where credentials can be set once in the environment.

---

## 🛠️ Available Tools

The server provides 22 tools for comprehensive ABAP system access. Each tool includes detailed input schemas accessible via the `/tools` endpoint.

### 🔍 Search & Discovery
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `SearchObject` | Search for ABAP objects across the system | `query`, `maxResults` |
| `API_Releases` | Retrieve API release information for ADT objects | `query` |

### 📖 Source Code Access  
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `Get_Class` | Retrieve ABAP class source code | `class_name` |
| `Get_Program` | Retrieve ABAP program source code | `program_name` |
| `Get_Function` | Retrieve function module source | `function_name`, `function_group` |
| `Get_FunctionGroup` | Retrieve function group source | `function_group` |
| `Get_Include` | Retrieve ABAP include source | `include_name` |
| `Get_Interface` | Retrieve ABAP interface source | `interface_name` |
| `Get_Transaction` | Retrieve ABAP transaction details | `transaction_name` |

### 🗂️ DDIC Metadata
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `GetDDIC_Table` | Retrieve database table definition | `object_name` |
| `GetDDIC_CDS` | Retrieve CDS view definition | `object_name` |
| `GetDDIC_Structure` | Retrieve DDIC structure definition | `object_name` |
| `GetDDIC_DataElements` | Retrieve data element definition | `object_name` |
| `GetDDIC_Domains` | Retrieve domain definition | `object_name` |
| `GetDDIC_TypeInfo` | Retrieve DDIC type information | `object_name` |

### 📊 Data & Diagnostics
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `DataPreview` | Preview actual data from DDIC entities | `ddicEntityName`, `rowNumber` |
| `Get_Package` | Retrieve package details and contents | `package_name` |
| `Get_MessageClass` | Retrieve message class information | `MessageClass` |

### 🔧 Runtime Analysis
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `GetRuntimeDumps` | Retrieve ABAP runtime dump list | `start_date`, `end_date`, `maxResults` |
| `GetRuntimeDumpDetails` | Get detailed runtime dump information | `id` |
| `Get_ABAPTraces` | Retrieve ABAP performance trace data | `user`, `maxResults` |
| `Get_ABAPTracesDetails` | Get detailed ABAP trace information | `id`, `type` |

> 💡 **Tip**: Use `GET /tools` to retrieve the complete catalog with JSON schemas for each tool.

---

## 📖 API Examples

### 🔧 Tool Execution Examples

**PowerShell (Windows):**
```powershell
# Search for ABAP objects
Invoke-RestMethod -Uri http://localhost:6969/call -Method POST `
  -Headers @{ 
    "X-SAP_USERNAME"="DEV00"
    "X-SAP_PASSWORD"="your-password"
    "X-SAP_URL"="http://your-sap-server:50000"
    "Content-Type"="application/json"
  } `
  -Body (@{ 
    tool="SearchObject"
    arguments=@{ query="SBOOK"; maxResults=10 } 
  } | ConvertTo-Json -Compress)

# Get ABAP class source
Invoke-RestMethod -Uri http://localhost:6969/call -Method POST `
  -Headers @{ 
    "X-SAP_USERNAME"="DEV00"
    "X-SAP_PASSWORD"="your-password"
    "X-SAP_URL"="http://your-sap-server:50000"
  } `
  -Body (@{ 
    tool="Get_Class"
    arguments=@{ class_name="CL_ABAP_CHAR_UTILITIES" } 
  } | ConvertTo-Json)
```

**curl (Linux/macOS):**
```bash
# Get table structure
curl -X POST http://localhost:6969/call \
  -H "X-SAP_USERNAME: DEV00" \
  -H "X-SAP_PASSWORD: your-password" \
  -H "X-SAP_URL: http://your-sap-server:50000" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "GetDDIC_Table",
    "arguments": {
      "object_name": "SBOOK"
    }
  }'

# Preview table data
curl -X POST http://localhost:6969/call \
  -H "X-SAP_USERNAME: DEV00" \
  -H "X-SAP_PASSWORD: your-password" \
  -H "X-SAP_URL: http://your-sap-server:50000" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "DataPreview",
    "arguments": {
      "ddicEntityName": "SBOOK",
      "rowNumber": 50
    }
  }'
```

**JavaScript/Node.js:**
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:6969',
  headers: {
    'X-SAP_USERNAME': 'DEV00',
    'X-SAP_PASSWORD': 'your-password',
    'X-SAP_URL': 'http://your-sap-server:50000',
    'Content-Type': 'application/json'
  }
});

async function getProgram(programName) {
  const response = await client.post('/call', {
    tool: 'Get_Program',
    arguments: {
      program_name: programName
    }
  });
  return response.data;
}

// Usage
getProgram('YSAPBC_DATA_GENERATOR')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

---

## 👩‍💻 Development & Testing

### 🔧 Development Setup
```bash
# Install dependencies
npm ci

# Build TypeScript
npm run build

# Run tests
npm test

# Start with MCP inspector (development)
npm run dev

# Run in watch mode during development
npm run build -- --watch
```

### 🧪 Testing Tools
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### 🔨 Adding New Tools

To extend the server with new ABAP functionality:

1. **Create Handler** - Add a new handler file in `src/handlers/`:
   ```typescript
   // src/handlers/handle_MyNewTool.ts
   export async function handleMyNewTool(args: any, config: SapConfig) {
     // Implementation here
     return { result: "success" };
   }
   ```

2. **Export Handler** - Add to `src/lib/handlerExports.ts`:
   ```typescript
   export * as handle_MyNewTool from '../handlers/handle_MyNewTool';
   ```

3. **Define Tool** - Add definition in `src/lib/toolDefinitions.ts`:
   ```typescript
   {
     name: 'MyNewTool',
     description: 'Description of what the tool does',
     inputSchema: {
       type: 'object',
       properties: {
         param1: { type: 'string', description: 'Parameter description' }
       },
       required: ['param1']
     },
     handler: handlers.handle_MyNewTool.handleMyNewTool
   }
   ```

4. **Build and Test**:
   ```bash
   npm run build
   npm test
   ```

### 🏗️ Project Structure
```
mcp-abap-adt/
├── src/
│   ├── handlers/          # Tool implementation handlers
│   └── lib/
│       ├── config.ts      # Configuration management
│       ├── toolDefinitions.ts  # Tool schemas and routing
│       ├── handlerExports.ts   # Handler exports
│       ├── remoteServer.ts     # HTTP/SSE server
│       ├── utils.ts            # Utility functions
│       └── mcpErrorHandler.ts  # Error handling
├── dist/                  # Compiled TypeScript output
├── index.ts              # Main server entry point
├── Dockerfile            # Container configuration
└── package.json          # Dependencies and scripts
```

---

## ❗ Troubleshooting

### 🔧 Common Issues & Solutions

**🚫 Port Required Error**
```
Error: PORT environment variable is required for remote mode
```
**Solution:**
```powershell
# Windows PowerShell
$env:PORT = "6969"

# Linux/macOS
export PORT=6969
```

**🌐 SAP URL Missing**
```
Error: SAP_URL is required
```
**Solution:** Ensure SAP URL is provided via environment variable or request headers:
```bash
# Environment variable
export SAP_URL="http://your-sap-server:50000"

# Or use X-SAP_URL header in requests
curl -H "X-SAP_URL: http://your-sap-server:50000" ...
```

**🔐 Authentication Failures**
```
Error: 401 Unauthorized
```
**Solutions:**
- Use Basic Auth: `Authorization: Basic <base64(username:password)>`
- Use custom headers: `X-SAP_USERNAME` and `X-SAP_PASSWORD`
- Check SAP user permissions for ADT access

**🏥 Container Health Check Issues**
```
Container unhealthy
```
**Solutions:**
- Ensure PORT environment variable is set
- Check container logs: `docker logs <container-id>`
- Verify SAP system connectivity

**📦 Build/Runtime Errors**
```
Module not found or TypeScript compilation errors
```
**Solutions:**
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm ci
npm run build

# Check Node.js version (requires ≥18)
node --version
```

**🔗 Connection Timeouts**
```
Error: connect ETIMEDOUT
```
**Solutions:**
- Verify SAP system is accessible
- Check network connectivity and firewall settings
- Ensure ADT services are enabled on SAP system
- Try setting `TLS_REJECT_UNAUTHORIZED=0` for self-signed certificates

### 📋 Debug Checklist

1. ✅ Node.js ≥ 18 installed
2. ✅ TypeScript compiled (`dist/` folder exists)
3. ✅ Environment variables set correctly
4. ✅ SAP system accessible and ADT enabled
5. ✅ Authentication credentials valid
6. ✅ Network connectivity (no proxy/firewall blocking)

### 🆘 Getting Help

If you encounter issues not covered here:

1. **Check the logs** - Enable debug logging with `NODE_ENV=development`
2. **Review configurations** - Verify all environment variables and headers
3. **Test SAP connectivity** - Ensure ADT services respond directly
4. **Open an issue** - Create a detailed issue on GitHub with logs and configuration

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run the test suite (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🔗 Links

- **Repository**: [https://github.com/workskong/mcp-abap-adt](https://github.com/workskong/mcp-abap-adt)
- **Issues**: [https://github.com/workskong/mcp-abap-adt/issues](https://github.com/workskong/mcp-abap-adt/issues)
- **NPM Package**: [@orchestraight.co/mcp-abap-adt](https://www.npmjs.com/package/@orchestraight.co/mcp-abap-adt)
- **Model Context Protocol**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

## 📊 Version History

- **v1.3.3** - Latest release
- Enhanced Docker support with Node.js 22
- Improved error handling and diagnostics
- Added comprehensive tool catalog

---

**Made with ❤️ for the SAP ABAP community**

