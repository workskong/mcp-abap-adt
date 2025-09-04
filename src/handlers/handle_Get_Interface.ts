import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface GetInterfaceArgs {
  interface_name: string;
  _sapUsername?: string;
  _sapPassword?: string;
}

export async function handleGetInterface(args: GetInterfaceArgs) {
  try {
    if (!args?.interface_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Interface name is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);

    const url = `${baseUrl}/sap/bc/adt/oo/interfaces/${args.interface_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
