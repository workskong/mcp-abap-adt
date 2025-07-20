# Debug Guide for HTTP 500 Error

## Issue Description
You encountered an HTTP 500 error when trying to access the "sbook" object:
```
HTTP error 500: {"detail":{"message":"Unexpected error","error":"500: {'message': 'Error: undefined'}"}}
```

## Fixes Applied

### 1. Fixed getBaseUrl() Function
**Problem**: The `getBaseUrl()` function in `src/lib/utils.ts` was incorrectly using `Buffer.from()` to convert the URL origin to a Buffer, which caused the "undefined" error.

**Fix**: Changed line 67 in `src/lib/utils.ts`:
```typescript
// Before
const baseUrl = Buffer.from(`${urlObj.origin}`);

// After  
const baseUrl = urlObj.origin;
```

### 2. Enhanced Error Handling
**Improvements**:
- Better error message formatting in `return_error()` function
- Added null safety for `response.data` in `return_response()` function
- Enhanced logging in `makeAdtRequest()` function
- Added configuration validation with detailed error messages

### 3. Added Debug Logging
- Added console logging to track request URLs and responses
- Enhanced error logging to identify specific failure points
- Added configuration validation logging

## How to Debug

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