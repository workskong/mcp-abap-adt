
# Debug & Troubleshooting Guide

This guide explains how to debug issues, interpret errors, and troubleshoot the MCP ABAP ADT Server. It reflects the latest project structure and best practices as of August 2025.

---

## 1. Environment & Configuration

- All SAP connection details are loaded from environment variables using the `.env` file and the `dotenv` package.
- Required variables:
  - `SAP_URL` (e.g., https://your-sap-system.com:8000)
  - `SAP_USERNAME`
  - `SAP_PASSWORD`
  - `SAP_CLIENT`
- If any variable is missing, the server will throw a clear error at startup.

**Example `.env` file:**
```
SAP_URL=https://your-sap-system.com:8000
SAP_USERNAME=your_username
SAP_PASSWORD=your_password
SAP_CLIENT=100
```

---

## 2. Error Handling & Logging

- All API and handler errors are caught and returned in a standardized format using the `return_error()` utility.
- HTTP and ADT request errors include status codes and response data for easier diagnosis.
- Console logging is used throughout the codebase to trace request URLs, endpoints tried, and error details (see `src/lib/utils.ts` and handler files).
- When an error occurs, check the server console for detailed logs, including endpoint URLs and error messages.

**Example error response:**
```
{
  "isError": true,
  "content": [
    { "type": "text", "text": "Error: HTTP 500: { ... }" }
  ]
}
```

---

## 3. Debugging Steps

### A. Enable Debug Logging

Set the following environment variables before starting the server to enable verbose debug output:
```
set DEBUG=mcp-abap-adt:*
set LOG_LEVEL=debug
```
On Linux/macOS, use `export` instead of `set`.

### B. Run Tests

- Use `npm test` to run all Jest-based tests in the `tests/` directory.
- To generate a new test file, use the script:
  ```
  npm run create:test <TestName>
  ```
  This creates a template in `tests/<TestName>.test.ts`.

### C. Common Issues & Solutions

| Issue                                 | Solution                                                      |
|---------------------------------------|---------------------------------------------------------------|
| Missing required environment variable | Check your `.env` file and ensure all variables are set        |
| Invalid URL in configuration          | Ensure `SAP_URL` is a valid URL (starts with http/https)      |
| HTTP 401 Unauthorized                 | Check your SAP credentials and client number                   |
| HTTP 404 Not Found                    | The object may not exist or you lack access                    |
| HTTP 500 Internal Server Error        | Check SAP system logs, permissions, and try with known object  |
| ADT service unavailable               | Ensure `/sap/bc/adt` is enabled on your SAP system             |

---

## 4. Debugging ABAP Object Access

If you encounter errors accessing an ABAP object (e.g., table, structure, etc.):

- Use the appropriate handler/tool for the object type:
  - For tables:
    ```json
    { "name": "GetDDICTable", "arguments": { "object_name": "SBOOK" } }
    ```
  - For structures:
    ```json
    { "name": "GetDDICStructure", "arguments": { "object_name": "SBOOK" } }
    ```
  - For search:
    ```json
    { "name": "SearchObject", "arguments": { "query": "SBOOK" } }
    ```

---

## 5. Advanced Debugging

- Add `console.log` statements in handler or utility files to trace values and flow.
- Use the verbose debug mode as described above.
- Test with different SAP objects to isolate the issue.
- Check SAP system logs for server-side errors.
- Verify network connectivity to your SAP system.

---

## 6. Additional Notes

- All handler logic is modularized in `src/handlers/` and registered in `src/toolDefinitions.ts`.
- Utility functions for requests, error formatting, and config are in `src/lib/utils.ts`.
- The project uses Jest for testing and includes a script for generating test templates.

For further help, review the README or open an issue on GitHub.

### 1. Run the Debug Script
```bash
node debug-sbook.js
```

This script will:
- Test your configuration
- Verify the base URL construction
- Test multiple ADT endpoints for the "sbook" object
- Provide detailed error information

### 2. Check Environment Variables
Make sure your `.env` file contains:
```
SAP_URL=https://your-sap-system.com
SAP_USERNAME=your-username
SAP_PASSWORD=your-password
SAP_CLIENT=your-client
```

### 3. Common Issues and Solutions

#### Issue: "Missing required environment variables"
**Solution**: Check your `.env` file and ensure all required variables are set.

#### Issue: "Invalid URL in configuration"
**Solution**: Verify your SAP_URL is a valid URL (should start with https:// or http://).

#### Issue: "HTTP 401 Unauthorized"
**Solution**: Check your username, password, and client credentials.

#### Issue: "HTTP 404 Not Found"
**Solution**: The "sbook" object might not exist in your SAP system or you might not have access to it.

#### Issue: "HTTP 500 Internal Server Error"
**Solution**: This could be a server-side issue. Try:
1. Using the debug script to test different endpoints
2. Checking if the object exists in your SAP system
3. Verifying your user has the necessary permissions

## Testing Different Object Types

If "sbook" is not a table, try these different handlers:

### For Tables:
```json
{
  "name": "GetDDICTable",
  "arguments": {
    "object_name": "sbook"
  }
}
```

### For Structures:
```json
{
  "name": "GetDDICStructure", 
  "arguments": {
    "object_name": "sbook"
  }
}
```

### For Search:
```json
{
  "name": "SearchObject",
  "arguments": {
    "query": "sbook"
  }
}
```

## Next Steps

1. Run the debug script to identify the specific issue
2. Check the console output for detailed error information
3. Verify your SAP system configuration
4. Test with a known existing object first
5. Contact your SAP administrator if the issue persists

## Additional Debugging

If you need more detailed debugging, you can:

1. Enable more verbose logging by adding console.log statements
2. Test with different SAP objects to isolate the issue
3. Check the SAP system logs for server-side errors
4. Verify network connectivity to your SAP system 