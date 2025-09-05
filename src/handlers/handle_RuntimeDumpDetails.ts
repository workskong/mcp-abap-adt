import { McpError, ErrorCode, makeAdtRequest, getBaseUrl, return_error, return_response } from '../lib/utils';
import { handleMcpError } from '../lib/mcpErrorHandler';

interface RuntimeDumpDetailsArgs {
  id?: string;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}
/*
 * @param args Parameters for runtime dump detail query
 * @returns AxiosResponse
 */
export async function handle_RuntimeDumpDetails(args: RuntimeDumpDetailsArgs): Promise<any> {
  try {
    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    if (!args?.id) {
      throw new McpError(ErrorCode.InvalidParams, 'id parameter is required');
    }
    let decodedId = decodeURIComponent(args.id);
    let encodedId = encodeURIComponent(decodedId);
    const url = `${baseUrl}/sap/bc/adt/runtime/dump/${encodedId}/formatted`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    return return_response(response);
  } catch (error) {
    return handleMcpError(error);
  }
}