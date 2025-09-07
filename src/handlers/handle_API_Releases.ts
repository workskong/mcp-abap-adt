import { McpError, ErrorCode, SapAuthParams, getBaseUrlFromAuth, makeAdtRequestWithAuth } from '../lib/utils';
import { return_error, return_response } from '../lib/utils';

interface APIReleasesArgs extends SapAuthParams {
  query: string;
  maxResults?: number;
}

// Search ??extract uri ??encode ??apireleases lookup method
export async function handle_API_Releases(args: APIReleasesArgs) {
  try {
    if (!args?.query) {
      throw new McpError(ErrorCode.InvalidParams, 'Search query is required');
    }
    
    const baseUrl = await getBaseUrlFromAuth(args);
    const maxResults = 1;
    const searchUrl = `${baseUrl}/sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=${args.query}*&maxResults=${maxResults}`;
    const searchResponse = await makeAdtRequestWithAuth(searchUrl, 'GET', 30000, undefined, undefined, 'json', args);
    if (searchResponse?.data) {
      const uriMatch = searchResponse.data.match(/<adtcore:objectReference[^>]*uri="([^"]*)"[^>]*>/);
      if (uriMatch && uriMatch[1]) {
        const originalUri = uriMatch[1];
        const encodedUri = encodeURIComponent(originalUri);
        const url = `${baseUrl}/sap/bc/adt/apireleases/${encodedUri}`;
        const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);
        return return_response(response);
      }
    }
  // If uri is not found, return the original search result
    return return_response(searchResponse);
  } catch (error) {
    return return_error(error);
  }
}
