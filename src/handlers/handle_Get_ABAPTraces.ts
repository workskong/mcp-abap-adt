
import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';
import { DOMParser, XMLSerializer } from 'xmldom';
import { AxiosResponse } from 'axios';

interface ABAPTraces {
  user?: string;
  maxResults?: number;
}

export async function Get_ABAPTraces(args: ABAPTraces) {
  try {
    if (args?.user === undefined || args.user === null) {
      throw new McpError(ErrorCode.InvalidParams, 'User is required');
    }

    // 빈 문자열일 경우에도 기본값 DEV00 사용, 항상 대문자로 변환
    const user = (args.user && args.user.trim() !== '' ? args.user : 'DEV00').toUpperCase();
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
    const limited = limitAtomEntries(xml, limitedMax);
    xml = limited.xml;
    const originalCount = limited.originalCount;

    // AxiosResponse 형태로 결과 래핑
    const response: AxiosResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
      data: xml,
    };
    // entry 개수 정보 및 잘림 안내 추가
    (response as any).originalEntryCount = originalCount;
    if (trimmedNotice) {
      (response as any).trimmedNotice = trimmedNotice;
    }
    return return_response(response);
  } catch (error: any) {
    return return_error(error);
  }
}

function limitAtomEntries(xmlString: string, maxCount: number): { xml: string, originalCount: number } {
  let originalCount = 0;
  let limitedXml = xmlString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const entries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');
    originalCount = entries.length;
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
    limitedXml = new XMLSerializer().serializeToString(doc);
  } catch { }
  return { xml: limitedXml, originalCount };
}