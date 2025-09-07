
import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface ABAPTracesDetails extends SapAuthParams {
  type?: string; // 'dbAccesses', 'hitlist', 'statements'
  id?: string;
}
/*
 * @param args Parameters for runtime dump detail query
 * @returns AxiosResponse
 */
export async function handle_Get_ABAPTracesDetails(args: ABAPTracesDetails): Promise<any> {
  try {

    if (!args?.id || !args?.type) {
    throw new McpError(ErrorCode.InvalidParams, 'Both "id" and "type" parameters are required.');
    }

    const baseUrl = await getBaseUrlFromAuth(args); if (args.type === 'all') {
    throw new McpError(ErrorCode.InvalidParams, 'The "type" parameter must be one of "dbAccesses", "hitlist", or "statements".');
    }
    const tracePaths: Record<string, string> = {
      dbAccesses: `/sap/bc/adt/runtime/traces/abaptraces/${args.id}/dbAccesses?withSystemEvents=false`,
      hitlist: `/sap/bc/adt/runtime/traces/abaptraces/${args.id}/hitlist?withSystemEvents=false`,
      statements: `/sap/bc/adt/runtime/traces/abaptraces/${args.id}/statements?id=1&withDetails=false&autoDrillDownThreshold=80&withSystemEvents=false`
    };
    if (!tracePaths[args.type]) {
    throw new McpError(ErrorCode.InvalidParams, 'The "type" parameter must be one of "dbAccesses", "hitlist", or "statements".');
    }
    const url = `${baseUrl}${tracePaths[args.type]}`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}