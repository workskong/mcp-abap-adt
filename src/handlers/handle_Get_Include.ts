import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface GetIncludeArgs {
  include_name: string;
}

export async function handleGetInclude(args: GetIncludeArgs) {
  try {
    if (!args?.include_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Include name is required');
    }
    
    const url = `${await getBaseUrl()}/sap/bc/adt/programs/includes/${args.include_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000);
    
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
