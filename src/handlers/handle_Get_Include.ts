import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetIncludeArgs extends SapAuthParams {
  include_name: string;
}

export async function handleGetInclude(args: GetIncludeArgs) {
  try {
    if (!args?.include_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Include name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);

    const url = `${baseUrl}/sap/bc/adt/programs/includes/${args.include_name}/source/main`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
