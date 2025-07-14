# mcp-abap-adt: Modern ABAP Development Tools MCP Server

[![smithery badge](https://smithery.ai/badge/@mario-andreschak/mcp-abap/server/@mario-andreschak connect to SAP ABAP systems with the Model Context Protocol (MCP).**  
This server bridges your ABAP backend and modern development tools like [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev), enabling seamless retrieval of ABAP source code, table structures, and more.

## 🚀 Quick Start

### 1. Prerequisites

- **SAP ABAP System**
  - System URL (e.g., `https://my-sap-system.com:8000`)
  - Valid username/password
  - SAP client number (e.g., `100`)
  - ADT services active (`/sap/bc/adt` in SICF)
  - For `GetTableContents`: custom service `/z_mcp_abap_adt/z_tablecontent` ([setup guide](https://community.sap.com/t5/application-development-blog-posts/how-to-use-rfc-read-table-from-javascript-via-webservice/ba-p/13172358))

- **Git** ([Download](https://git-scm.com/downloads)) or **GitHub Desktop** ([Download](https://desktop.github.com/))

- **Node.js (LTS) & npm** ([Download](https://nodejs.org/en/download/))
  - Verify installation:
    ```bash
    node -v
    npm -v
    ```

### 2. Installation & Setup

#### ⚡️ Quick Install (Smithery)
```bash
npx -y @smithery/cli install @mario-andreschak/mcp-abap-adt --client cline
```

#### 🛠️ Manual Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mario-andreschak/mcp-abap-adt.git
   cd mcp-abap-adt
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Create a `.env` file in the root directory:
   ```
   SAP_URL=https://your-sap-system.com:8000
   SAP_USERNAME=your_username
   SAP_PASSWORD=your_password
   SAP_CLIENT=100
   ```
   *If your password contains `#`, enclose it in quotes.*  
   **Never commit your `.env` file!**

### 3. Running the Server

You typically integrate this server with an MCP client (like Cline or Claude Desktop), but standalone runs are also supported:

- **Standalone Mode:**  
  Run the server directly and monitor terminal output.
  ```bash
  npm run start
  ```
  The server will listen for MCP client connections.

- **Development/Debug Mode (with Inspector):**  
  Launch with the MCP Inspector for debugging and exploration.
  ```bash
  npm run dev
  ```
  Open the Inspector URL (e.g., `http://localhost:5173`) in your browser.

### 4. Integrating with Cline (VS Code)

1. **Install Cline:**  
   Add the "Cline" extension from the VS Code Marketplace.

2. **Open Cline Settings:**
   - Go to VS Code settings (File → Preferences → Settings, or `Ctrl+,`)
   - Search for "Cline MCP Settings"
   - Click "Edit in settings.json" to open `cline_mcp_settings.json`

3. **Add Server Configuration:**  
   Insert your server details in the `mcpServers` object:
   ```json
   {
     "mcpServers": {
       "mcp-abap-adt": {
         "command": "node",
         "args": [
           "C:/PATH_TO/mcp-abap-adt/dist/index.js"
         ],
         "disabled": true,
         "autoApprove": []
       }
       // ... other server configurations ...
     }
   }
   ```

4. **Test the Connection:**
   - Cline should display the server in the "MCP Servers" panel.
   - Use Cline to fetch ABAP source code, and confirm the MCP server responds.

### 5. Troubleshooting

- **Node.js or npm not found:**  
  Reinstall Node.js and ensure it's in your PATH.

- **`npm install` fails:**  
  - Check your internet connection.
  - Delete `node_modules` and retry.
  - Configure npm proxy settings if needed.

- **Cline cannot connect:**  
  - Double-check the absolute path in `cline_mcp_settings.json`.
  - Ensure the server is running.
  - Restart VS Code.
  - Try running:
    ```bash
    npm install
    npm run build
    npx @modelcontextprotocol/inspector node dist/index.js
    ```
    Then open the Inspector URL and connect.

- **SAP connection errors:**  
  - Verify credentials in `.env`.
  - Ensure SAP system is accessible and user has proper authorizations.
  - Confirm ADT services are active in `SICF`.
  - For self-signed certificates, adjust `TLS_REJECT_UNAUTHORIZED` as needed.

## 🛠️ Available Tools

| Tool Name        | Description                                 | Input Parameters                                             | Example Usage (Cline)                                       |
|------------------|---------------------------------------------|--------------------------------------------------------------|-------------------------------------------------------------|
| `GetProgram`     | Retrieve ABAP program source code           | `program_name` (string)                                      | `@tool GetProgram program_name=ZMY_PROGRAM`                 |
| `GetClass`       | Retrieve ABAP class source code             | `class_name` (string)                                        | `@tool GetClass class_name=ZCL_MY_CLASS`                    |
| `GetFunctionGroup` | Retrieve ABAP Function Group source code  | `function_group` (string)                                    | `@tool GetFunctionGroup function_group=ZMY_FUNCTION_GROUP`   |
| `GetFunction`    | Retrieve ABAP Function Module source code   | `function_name` (string), `function_group` (string)          | `@tool GetFunction function_name=ZMY_FUNCTION function_group=ZFG` |
| `GetStructure`   | Retrieve ABAP Structure                     | `structure_name` (string)                                    | `@tool GetStructure structure_name=ZMY_STRUCT`               |
| `GetTable`       | Retrieve ABAP table structure               | `table_name` (string)                                        | `@tool GetTable table_name=ZMY_TABLE`                        |
| `GetTableContents` | Retrieve ABAP table contents              | `table_name` (string), `max_rows` (number, optional, default 100) | `@tool GetTableContents table_name=ZMY_TABLE max_rows=50`    |
| `GetPackage`     | Retrieve ABAP package details               | `package_name` (string)                                      | `@tool GetPackage package_name=ZMY_PACKAGE`                  |
| `GetTypeInfo`    | Retrieve ABAP type information              | `type_name` (string)                                         | `@tool GetTypeInfo type_name=ZMY_TYPE`                       |
| `GetInclude`     | Retrieve ABAP include source code           | `include_name` (string)                                      | `@tool GetInclude include_name=ZMY_INCLUDE`                  |
| `SearchObject`   | Search for ABAP objects                     | `query` (string), `maxResults` (number, optional, default 100) | `@tool SearchObject query=ZMY* maxResults=20`                |
| `GetInterface`   | Retrieve ABAP interface source code         | `interface_name` (string)                                    | `@tool GetInterface interface_name=ZIF_MY_INTERFACE`         |
| `GetTransaction` | Retrieve ABAP transaction details           | `transaction_name` (string)                                  | `@tool GetTransaction transaction_name=ZMY_TRANSACTION`      |
| `GetCDS`         | Retrieve ABAP CDS view source/metadata      | `cds_name` (string)                                          | `@tool GetCDS cds_name=ZMY_CDSVIEW`                         |
| `GetWhereUsed`   | Find references/usages of ABAP objects      | `object_name` (string), `object_type` (string, optional), `max_results` (number, optional) | `@tool GetWhereUsed object_name=ZCL_MY_CLASS object_type=CLASS max_results=20` |

**Build modern ABAP workflows with ease.**  
For more details, visit the [Smithery server page](https://smithery.ai/server/@mario-andreschak/mcp-abap-adt).