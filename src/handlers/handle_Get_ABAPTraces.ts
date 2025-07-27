import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';
import { DOMParser, XMLSerializer } from 'xmldom';
import { AxiosResponse } from 'axios';

interface ABAPTraces {
  user?: string;
  maxResults?: number;
  objectNameFilter?: string;
}

export async function Get_ABAPTraces(args: ABAPTraces) {
  try {
    // user가 undefined/null/빈 문자열/비문자열이면 에러, 정상 입력은 항상 대문자로 변환
    if (typeof args.user !== 'string' || args.user.trim() === '') {
      throw new McpError(ErrorCode.InvalidParams, 'User is required');
    }
    const user = args.user.trim().toUpperCase();
    const maxResults = args.maxResults ?? 5;
    let trimmedNotice = '';
    let limitedMax = maxResults;
    if (maxResults > 5) {
      trimmedNotice = '요청한 maxResults가 5개를 초과하여 5개까지만 반환되고 나머지는 삭제되었습니다.';
      limitedMax = 5;
    }

    const url = `${await getBaseUrl()}/sap/bc/adt/runtime/traces/abaptraces?user=${user}`;
    const adtRes = await makeAdtRequest(url, 'GET', 30000, undefined, undefined, 'text');
    let xml = adtRes.data;

    // <atom:entry> 요소 개수 제한 및 원본 개수 반환, 항상 link 제거
    const limited = limitAtomEntries(xml, limitedMax, args.objectNameFilter);
    xml = limited.xml;
    const totalCount = limited.totalCount;
    const displayCount = limited.displayCount ?? limited.totalCount;

    // xml 최상단에 <atom:mcp_info> 태그 삽입
    const mcpInfoTag = `\n<atom:mcp_info>\n  <atom:timeUnit>us</atom:timeUnit>\n  <atom:sizeUnit>byte</atom:sizeUnit>\n  <atom:totalCount>${totalCount}</atom:totalCount>\n  <atom:displayCount>${displayCount}</atom:displayCount>\n</atom:mcp_info>\n`;
    // xml 헤더 바로 뒤에 삽입 (헤더가 없으면 맨 앞)
    const xmlWithInfo = xml.replace(/(<\?xml[^>]*>\s*)?/, (m) => m + mcpInfoTag);

    // AxiosResponse 형태로 결과 래핑
    const response: AxiosResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      data: xmlWithInfo,
    };
    return return_response(response);
  } catch (error: any) {
    return return_error(error);
  }
}

function limitAtomEntries(
  xmlString: string,
  maxCount: number,
  objectNameFilter?: string
): { xml: string, totalCount: number, displayCount: number } {
  let totalCount = 0;
  let displayCount = 0;
  let limitedXml = xmlString;
  // objectNameFilter를 진입 시 대문자로 변환
  const filterUpper = typeof objectNameFilter === 'string' ? objectNameFilter.trim().toUpperCase() : undefined;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    let entries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');
    
    // objectName 필터링: <trc:extendedData> 내부의 <trc:objectName>을 찾아서 정확히 매칭될 때만 남김
    if (filterUpper) {
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        let match = false;
        // <trc:extendedData> 내부의 <trc:objectName> 찾기
        const extDataElems = entry.getElementsByTagNameNS('http://www.sap.com/adt/runtime/traces/abaptraces', 'extendedData');
        if (extDataElems.length > 0) {
          const objNameElems = extDataElems[0].getElementsByTagNameNS('http://www.sap.com/adt/runtime/traces/abaptraces', 'objectName');
          if (objNameElems.length > 0) {
            const objName = objNameElems[0].textContent?.trim() || '';
            if (objName.toUpperCase() === filterUpper) {
              match = true;
            }
          }
        }
        // objectName이 정확히 매칭될 때만 남김, 없으면 삭제
        if (!match) {
          entry.parentNode?.removeChild(entry);
        }
      }
    }
    // 필터링 후 남은 entry 개수
    totalCount = entries.length;

    // entry 개수 제한
    if (entries.length > maxCount) {
      for (let i = entries.length - 1; i >= maxCount; i--) {
        const entry = entries[i];
        entry.parentNode?.removeChild(entry);
      }
    }
    // 항상 entry 내 atom:link 엘리먼트 모두 제거
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const links = entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'link');
      for (let j = links.length - 1; j >= 0; j--) {
        links[j].parentNode?.removeChild(links[j]);
      }
    }
    // 실제 보여지는 entry 개수
    displayCount = entries.length;

    limitedXml = new XMLSerializer().serializeToString(doc);
  } catch { }
  return { xml: limitedXml, totalCount, displayCount };
}