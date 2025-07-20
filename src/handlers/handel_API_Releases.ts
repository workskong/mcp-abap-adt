import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

// 검색 → uri 추출 → 인코딩 → apireleases 조회 방식
export async function handel_API_Releases(args: { query: string; maxResults?: number }) {

  try {
    if (!args?.query) {
      throw new McpError(ErrorCode.InvalidParams, 'Search query is required');
    }
    const maxResults = 1;
    const searchUrl = `${await getBaseUrl()}/sap/bc/adt/repository/informationsystem/search?operation=quickSearch&query=${args.query}*&maxResults=${maxResults}`;
    const searchResponse = await makeAdtRequest(searchUrl, 'GET', 30000);
    if (searchResponse?.data) {
      const uriMatch = searchResponse.data.match(/<adtcore:objectReference[^>]*uri="([^"]*)"[^>]*>/);
      if (uriMatch && uriMatch[1]) {
        const originalUri = uriMatch[1];
        const encodedUri = encodeURIComponent(originalUri);
        const url = `${await getBaseUrl()}/sap/bc/adt/apireleases/${encodedUri}`;
        const response = await makeAdtRequest(url, 'GET', 30000);
        return return_response(response);
      }
    }
    // uri를 찾지 못한 경우 원본 검색 결과 반환
    return return_response(searchResponse);
  } catch (error) {
    return return_error(error);
  }
}
