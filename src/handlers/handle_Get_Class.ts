import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetClassArgs extends SapAuthParams {
  class_name: string;
}

export async function handleGetClass(args: GetClassArgs) {
  try {
    if (!args?.class_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Class name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/oo/classes/${args.class_name}/source/main`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'text', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
