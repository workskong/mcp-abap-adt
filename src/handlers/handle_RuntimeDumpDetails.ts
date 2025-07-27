import { McpError, ErrorCode, makeAdtRequest, getBaseUrl, return_error, return_response } from '../lib/utils';
import { handleMcpError } from '../lib/mcpErrorHandler';

interface RuntimeDumpDetailsArgs {
  id?: string;
}
/**
 * 런타임 덤프 상세 정보를 id 기준으로 조회합니다.
 * @param args Parameters for runtime dump detail query
 * @returns AxiosResponse
 */
export async function handle_RuntimeDumpDetails(args: RuntimeDumpDetailsArgs): Promise<any> {
  try {
    if (!args?.id) {
      throw new McpError(ErrorCode.InvalidParams, 'id 파라미터가 필요합니다');
    }
    // id를 무조건 디코딩 후, 다시 인코딩
    let decodedId = decodeURIComponent(args.id);
    let encodedId = encodeURIComponent(decodedId);
    const url = `${await getBaseUrl()}/sap/bc/adt/runtime/dump/${encodedId}/formatted`;
    const response = await makeAdtRequest(url, 'GET', 30000);
    return return_response(response);
  } catch (error) {
    return handleMcpError(error);
  }
}