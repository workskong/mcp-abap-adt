
import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface ABAPTracesDetails {
  type?: string; // 'dbAccesses', 'hitlist', 'statements'
  id?: string;
  _sapUsername?: string;
  _sapPassword?: string;
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

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword); if (args.type === 'all') {
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
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword);
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}