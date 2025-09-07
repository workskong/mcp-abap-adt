import { McpError, ErrorCode, SapAuthParams, getBaseUrlFromAuth, makeAdtRequestWithAuth } from '../lib/utils';
import { return_error, return_response } from '../lib/utils';

interface SearchObjectArgs extends SapAuthParams {
  query: string;
  maxResults?: number;
}

export async function handleSearchObject(args: SearchObjectArgs) {
  try {
    if (!args?.query) {
      throw new McpError(ErrorCode.InvalidParams, 'Search query is required');
    }

    const maxResults = args.maxResults || 100;
    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=${args.query}*&maxResults=${maxResults}`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
