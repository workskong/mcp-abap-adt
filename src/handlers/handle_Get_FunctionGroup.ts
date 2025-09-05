import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface GetFunctionGroupArgs {
  function_group: string;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}

export async function handleGetFunctionGroup(args: GetFunctionGroupArgs) {
  try {
    if (!args?.function_group) {
      throw new McpError(ErrorCode.InvalidParams, 'Function Group is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);

    const url = `${baseUrl}/sap/bc/adt/functions/groups/${args.function_group}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
