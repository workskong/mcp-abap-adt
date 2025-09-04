import { makeAdtRequest, getBaseUrl, McpError, return_error, return_response, ErrorCode } from '../lib/utils';
import { handleMcpError } from '../lib/mcpErrorHandler';
import { DOMParser, XMLSerializer } from 'xmldom';
import { AxiosResponse } from 'axios';

// Runtime dump list query parameter type
export interface RuntimeDumpsArgs {
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  maxResults?: number;
  _sapUsername?: string;
  _sapPassword?: string;
}

export async function handle_RuntimeDumps(args: RuntimeDumpsArgs): Promise<any> {
  try {
    const startDate = args.start_date ? args.start_date.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let endDate = (typeof args.end_date === 'string' && args.end_date.trim() !== '')
      ? args.end_date.replace(/-/g, '')
      : startDate;
    const startTime = args.start_time ? args.start_time.replace(/:/g, '') : '000000';
    const endTime = args.end_time ? args.end_time.replace(/:/g, '') : '235959';
    const category = args.category;
    let maxResults = args.maxResults ?? 1;
    let trimmedNotice = '';
    if (maxResults > 5) {
      trimmedNotice = '요청한 maxResults가 5개를 초과하여 5개까지만 반환되고 나머지는 삭제되었습니다.';
      maxResults = 5;
    }

    // from, to 포맷 생성
    const from = `${startDate}${startTime}`;
    const to = `${endDate}${endTime}`;

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword);
    // SAP ADT API 호출
    const requestUrl = `${baseUrl}/sap/bc/adt/runtime/dumps?from=${from}&to=${to}`;
    const adtRes = await makeAdtRequest(requestUrl, 'GET', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword);
    let xml = adtRes.data;

    // <atom:entry> 요소 개수 제한 및 카테고리 필터링
    const limited = limitAtomEntriesWithCategory(xml, maxResults, category);
    const totalCount = limited.totalCount;
    const displayCount = limited.displayCount;
    xml = limited.xml;

    // xml 최상단에 <atom:mcp_info> 태그 삽입
    const mcpInfoTag = `\n<atom:mcp_info>\n  <atom:timeUnit>us</atom:timeUnit>\n  <atom:sizeUnit>byte</atom:sizeUnit>\n  <atom:totalCount>${totalCount}</atom:totalCount>\n  <atom:displayCount>${displayCount}</atom:displayCount>\n</atom:mcp_info>\n`;
    // xml 헤더 바로 뒤에 삽입 (헤더가 없으면 맨 앞)
    const xmlWithInfo = xml.replace(/(<\?xml[^>]*>\s*)?/, (m) => m + mcpInfoTag);

    // AxiosResponse 형태로 결과 래핑 (ADT 응답값 활용)
    const response: AxiosResponse = {
      status: adtRes.status,
      statusText: adtRes.statusText,
      headers: adtRes.headers,
      config: adtRes.config,
      data: xmlWithInfo,
    };
    return return_response(response);
  } catch (error: any) {
    return handleMcpError(error);
  }
}

function limitAtomEntriesWithCategory(xmlString: string, maxCount: number, category?: string): { xml: string, totalCount: number, displayCount: number } {
  let totalCount = 0;
  let displayCount = 0;
  let limitedXml = xmlString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const entries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');

    // category 필터링
    if (category) {
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        const cats = entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'category');
        let match = false;
        for (let j = 0; j < cats.length; j++) {
          const term = cats[j].getAttribute('term');
          if (term === category) {
            match = true;
            break;
          }
        }
        if (!match) {
          entry.parentNode?.removeChild(entry);
        }
      }
    }
    // 필터링 후 남은 entry 개수
    totalCount = entries.length;

    // Remove <contributor>, <icon>, <link> elements (only the element itself, not parent)
    const atomTags = ['contributor', 'icon', 'link'];
    atomTags.forEach(tag => {
      const elements = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', tag);
      // Remove each element from its parent
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        el.parentNode?.removeChild(el);
      }
    });

    // entry 개수 제한
    const filteredEntries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');
    if (filteredEntries.length > maxCount) {
      for (let i = filteredEntries.length - 1; i >= maxCount; i--) {
        const entry = filteredEntries[i];
        entry.parentNode?.removeChild(entry);
      }
    }
    // 실제 보여지는 entry 개수
    displayCount = entries.length;

    limitedXml = new XMLSerializer().serializeToString(doc);
  } catch { }
  return { xml: limitedXml, totalCount, displayCount };
}
