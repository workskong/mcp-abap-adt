import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface GetFunctionGroupArgs {
  function_group: string;
}

export async function handleGetFunctionGroup(args: GetFunctionGroupArgs) {
  try {
    if (!args?.function_group) {
      throw new McpError(ErrorCode.InvalidParams, 'Function Group is required');
    }

    const url = `${await getBaseUrl()}/sap/bc/adt/functions/groups/${args.function_group}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
