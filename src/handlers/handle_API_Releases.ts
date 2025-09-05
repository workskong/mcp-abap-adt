import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface APIReleasesArgs {
  query: string;
  maxResults?: number;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}

// Search → extract uri → encode → apireleases lookup method
export async function handle_API_Releases(args: APIReleasesArgs) {
  try {
    if (!args?.query) {
      throw new McpError(ErrorCode.InvalidParams, 'Search query is required');
    }
    
    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    const maxResults = 1;
    const searchUrl = `${baseUrl}/sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=${args.query}*&maxResults=${maxResults}`;
    const searchResponse = await makeAdtRequest(searchUrl, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    if (searchResponse?.data) {
      const uriMatch = searchResponse.data.match(/<adtcore:objectReference[^>]*uri="([^"]*)"[^>]*>/);
      if (uriMatch && uriMatch[1]) {
        const originalUri = uriMatch[1];
        const encodedUri = encodeURIComponent(originalUri);
        const url = `${baseUrl}/sap/bc/adt/apireleases/${encodedUri}`;
        const response = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
        return return_response(response);
      }
    }
  // If uri is not found, return the original search result
    return return_response(searchResponse);
  } catch (error) {
    return return_error(error);
  }
}
