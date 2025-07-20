import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface DDICCDSArgs {
  object_name: string;
}

export async function handle_DDIC_CDS(args: DDICCDSArgs) {
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Object name is required');
    }
    
    const url = `${await getBaseUrl()}/sap/bc/adt/ddic/elementinfo?path=${args.object_name}`;
    const response = await makeAdtRequest(url, 'GET', 30000);
    
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}