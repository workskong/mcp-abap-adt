import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface MessageClassArgs extends SapAuthParams {
  MessageClass: string;
}

export async function handle_Get_MessageClass(args: MessageClassArgs) {
  try {
    const messageClass = args?.MessageClass;
    if (!messageClass) {
      throw new McpError(ErrorCode.InvalidParams, 'Message Class name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/messageclass/${messageClass}`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
