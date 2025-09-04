import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface MessageClassArgs {
  MessageClass: string;
  _sapUsername?: string;
  _sapPassword?: string;
}

export async function handle_Get_MessageClass(args: MessageClassArgs) {
  try {
    const messageClass = args?.MessageClass;
    if (!messageClass) {
      throw new McpError(ErrorCode.InvalidParams, 'Message Class name is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);
    const url = `${baseUrl}/sap/bc/adt/messageclass/${messageClass}`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
