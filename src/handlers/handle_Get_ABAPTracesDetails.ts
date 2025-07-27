
import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface ABAPTracesDetails {
  type?: string; // 'dbAccesses', 'hitlist', 'statements'
  id?: string;
}
/**
 * @param args Parameters for runtime dump detail query
 * @returns AxiosResponse
 */
export async function handle_Get_ABAPTracesDetails(args: ABAPTracesDetails): Promise<any> {
  try {
    if (!args?.id || !args?.type) {
      throw new McpError(ErrorCode.InvalidParams, 'id와 type 파라미터가 필요합니다');
    }
    if (args.type === 'all') {
      throw new McpError(ErrorCode.InvalidParams, 'type 파라미터는 "dbAccesses", "hitlist", "statements" 중 하나여야 합니다.');
    }
    const tracePaths: Record<string, string> = {
      dbAccesses: `/sap/bc/adt/runtime/traces/abaptraces/${args.id}/dbAccesses?withSystemEvents=false`,
      hitlist: `/sap/bc/adt/runtime/traces/abaptraces/${args.id}/hitlist?withSystemEvents=false`,
      statements: `/sap/bc/adt/runtime/traces/abaptraces/${args.id}/statements?id=1&withDetails=false&autoDrillDownThreshold=80&withSystemEvents=false`
    };
    if (!tracePaths[args.type]) {
      throw new McpError(ErrorCode.InvalidParams, 'type 파라미터는 "dbAccesses", "hitlist", "statements" 중 하나여야 합니다.');
    }
    const url = `${await getBaseUrl()}${tracePaths[args.type]}`;
    const response = await makeAdtRequest(url, 'GET', 30000);
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}