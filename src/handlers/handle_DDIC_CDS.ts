import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface DDICCDSArgs {
  object_name: string;
  _sapUsername?: string;
  _sapPassword?: string;
}

export async function handle_DDIC_CDS(args: DDICCDSArgs) {
  try {
    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Object name is required');
    }

    const url = `${baseUrl}/sap/bc/adt/ddic/elementinfo?path=${args.object_name}`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}