import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface GetClassArgs {
  class_name: string;
}

export async function handleGetClass(args: GetClassArgs) {
  try {
    if (!args?.class_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Class name is required');
    }
    
    const url = `${await getBaseUrl()}/sap/bc/adt/oo/classes/${args.class_name}/source/main`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'text');
    
    // 소스코드를 변환 없이 그대로 반환하지 않고, 기존 방식대로 처리
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
