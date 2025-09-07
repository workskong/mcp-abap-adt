import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetFunctionArgs extends SapAuthParams {
  function_name: string;
  function_group: string;
}

export async function handleGetFunction(args: GetFunctionArgs) {
  try {
    if (!args?.function_name || !args?.function_group) {
      throw new McpError(ErrorCode.InvalidParams, 'Function name and group are required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/functions/groups/${args.function_group}/fmodules/${args.function_name}/source/main`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
