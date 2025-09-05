import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface SearchObjectArgs {
  query: string;
  maxResults?: number;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}

export async function handleSearchObject(args: SearchObjectArgs) {
  try {
    if (!args?.query) {
      throw new McpError(ErrorCode.InvalidParams, 'Search query is required');
    }

    const maxResults = args.maxResults || 100;
    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    const url = `${baseUrl}/sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=${args.query}*&maxResults=${maxResults}`;
    const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
