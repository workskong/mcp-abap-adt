import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetInterfaceArgs extends SapAuthParams {
  interface_name: string;
}

export async function handleGetInterface(args: GetInterfaceArgs) {
  try {
    if (!args?.interface_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Interface name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);

    const url = `${baseUrl}/sap/bc/adt/oo/interfaces/${args.interface_name}/source/main`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
