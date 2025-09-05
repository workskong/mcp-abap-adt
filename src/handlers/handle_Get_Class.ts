import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface GetClassArgs {
  class_name: string;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}

export async function handleGetClass(args: GetClassArgs) {
  try {
    if (!args?.class_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Class name is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    const url = `${baseUrl}/sap/bc/adt/oo/classes/${args.class_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'text', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
