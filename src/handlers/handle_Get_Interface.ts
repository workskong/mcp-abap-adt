import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface GetInterfaceArgs {
  interface_name: string;
}

export async function handleGetInterface(args: GetInterfaceArgs) {
  try {
    if (!args?.interface_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Interface name is required');
    }

    const url = `${await getBaseUrl()}/sap/bc/adt/oo/interfaces/${args.interface_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
