import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface MessageClassArgs {
  MessageClass: string;
}

export async function handle_Get_MessageClass(args: MessageClassArgs) {
  try {
    const messageClass = args?.MessageClass;
    if (!messageClass) {
      throw new McpError(ErrorCode.InvalidParams, 'Message Class name is required');
    }

    const url = `http://203.229.171.207:50000/sap/bc/adt/messageclass/${messageClass}`;
    const response = await makeAdtRequest(url, 'GET', 30000);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
