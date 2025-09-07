import { McpError, ErrorCode, getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response, SapAuthParams } from '../lib/utils';
import { handleMcpError } from '../lib/mcpErrorHandler';

interface RuntimeDumpDetailsArgs extends SapAuthParams {
  id?: string;
}
/*
 * @param args Parameters for runtime dump detail query
 * @returns AxiosResponse
 */
export async function handle_RuntimeDumpDetails(args: RuntimeDumpDetailsArgs): Promise<any> {
  try {
    const baseUrl = await getBaseUrlFromAuth(args);
    if (!args?.id) {
      throw new McpError(ErrorCode.InvalidParams, 'id parameter is required');
    }
    let decodedId = decodeURIComponent(args.id);
    let encodedId = encodeURIComponent(decodedId);
    const url = `${baseUrl}/sap/bc/adt/runtime/dump/${encodedId}/formatted`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);
    return return_response(response);
  } catch (error) {
    return handleMcpError(error);
  }
}