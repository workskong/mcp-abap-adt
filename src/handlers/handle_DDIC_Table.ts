import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface DDICTableArgs {
  object_name: string;
}

export async function handle_DDIC_Table(args: DDICTableArgs) {
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Object name is required');
    }
    
    const url = `${await getBaseUrl()}/sap/bc/adt/ddic/elementinfo?path=${args.object_name}`;
    console.log(`Requesting table info for: ${args.object_name} at URL: ${url}`);
    
    const response = await makeAdtRequest(url, 'GET', 30000);
    
    return return_response(response);
  } catch (error) {
    console.error(`Error in handle_DDIC_Table for ${args?.object_name}:`, error);
    return return_error(error);
  }
}