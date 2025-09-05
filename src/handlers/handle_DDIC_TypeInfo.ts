import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface DDICTypeInfoArgs {
  object_name: string;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}

export async function handle_DDIC_TypeInfo(args: DDICTypeInfoArgs) {
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Object name is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);

    const url = `${baseUrl}/sap/bc/adt/ddic/elementinfo?path=${args.object_name}`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}