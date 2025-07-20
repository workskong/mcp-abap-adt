import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface GetClassArgs {
  class_name: string;
}

export async function handleGetClass(args: GetClassArgs) {
  try {
    if (!args?.class_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Class name is required');
    }
    
    const url = `${await getBaseUrl()}/sap/bc/adt/oo/classes/${args.class_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000);
    
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
