import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetProgramArgs extends SapAuthParams {
  program_name: string;
}

export async function handleGetProgram(args: GetProgramArgs) {
  try {
    if (!args?.program_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Program name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/programs/programs/${args.program_name}/source/main`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}