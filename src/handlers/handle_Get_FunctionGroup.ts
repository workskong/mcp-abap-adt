import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetFunctionGroupArgs extends SapAuthParams {
  function_group: string;
}

export async function handleGetFunctionGroup(args: GetFunctionGroupArgs) {
  try {
    if (!args?.function_group) {
      throw new McpError(ErrorCode.InvalidParams, 'Function Group is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);

    const url = `${baseUrl}/sap/bc/adt/functions/groups/${args.function_group}/source/main`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
