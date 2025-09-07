import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface DDICTableArgs extends SapAuthParams {
  object_name: string;
}

export async function handle_DDIC_Table(args: DDICTableArgs) {
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Object name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/ddic/elementinfo?path=${args.object_name}`;    
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);
    
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}