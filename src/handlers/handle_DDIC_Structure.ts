import { McpError, ErrorCode, convertXmlToJson } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface DDICStructureArgs {
  object_name: string;
  _sapUsername?: string;
  _sapPassword?: string;
}

export async function handle_DDIC_Structure(args: DDICStructureArgs) {
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Object name is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);

    const url = `${baseUrl}/sap/bc/adt/ddic/elementinfo?path=${args.object_name}`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}