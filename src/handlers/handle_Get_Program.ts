import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface GetProgramArgs {
  program_name: string;
}

export async function handleGetProgram(args: GetProgramArgs) {
  try {
    if (!args?.program_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Program name is required');
    }

    const url = `${await getBaseUrl()}/sap/bc/adt/programs/programs/${args.program_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}