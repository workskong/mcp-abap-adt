import { makeAdtRequest, getBaseUrl, McpError, return_error, return_response, ErrorCode } from '../lib/utils';
import { handleMcpError } from '../lib/mcpErrorHandler';
import { DOMParser, XMLSerializer } from 'xmldom';
import { AxiosResponse } from 'axios';

// 런타임 덤프 리스트 조회 파라미터 타입
export interface RuntimeDumpsArgs {
  start_date?: string;  // YYYY-MM-DD 또는 YYYYMMDD 형식
  end_date?: string;    // YYYY-MM-DD 또는 YYYYMMDD 형식
  start_time?: string;  // 00:00:00 또는 000000 기본값 000000
  end_time?: string;    // 00:00:00 또는 000000 기본값 235959
  category?: string;    // 선택적
  maxResults?: number;
}

export async function handle_RuntimeDumps(args: RuntimeDumpsArgs): Promise<any> {
  try {
    // 파라미터 기본값 및 정규화
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

    // SAP ADT API 호출
    const requestUrl = `${await getBaseUrl()}/sap/bc/adt/runtime/dumps?from=${from}&to=${to}`;
    const adtRes = await makeAdtRequest(requestUrl, 'GET', 30000);
    let xml = adtRes.data;

    // <atom:entry> 요소 개수 제한 및 카테고리 필터링
    const limited = limitAtomEntriesWithCategory(xml, maxResults, category);
    const originalCount = limited.originalCount;
    xml = limited.xml;

    // 엔트리 개수 확인 후 조건에 맞는 데이터가 없으면 에러 메시지 반환
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const filteredEntries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');
    if (filteredEntries.length === 0) {
      return return_error({
        code: 'NO_DATA',
        message: '조건에 맞는 데이터가 없습니다.'
      });
    }

    // AxiosResponse 형태로 결과 래핑 (ADT 응답값 활용)
    const response: AxiosResponse = {
      status: adtRes.status,
      statusText: adtRes.statusText,
      headers: adtRes.headers,
      config: adtRes.config,
      data: xml,
    };
    // entry 개수 정보 및 잘림 안내 추가
    (response as any).originalEntryCount = originalCount;
    if (trimmedNotice) {
      (response as any).trimmedNotice = trimmedNotice;
    }
    return return_response(response);
  } catch (error: any) {
    return handleMcpError(error);
  }
}

/**
 * XML Atom 피드에서 <atom:entry> 요소를 최대 maxCount개만 남기고 초과분은 모두 제거
 * category 파라미터가 있으면 해당 category와 일치하지 않는 entry는 제거
 * @param xmlString 원본 XML 문자열
 * @param maxCount 남길 entry 최대 개수
 * @param category category term 값 (옵션)
 * @returns { xml: string, originalCount: number }
 */
function limitAtomEntriesWithCategory(xmlString: string, maxCount: number, category?: string): { xml: string, originalCount: number } {
  let originalCount = 0;
  let limitedXml = xmlString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const entries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');
    originalCount = entries.length;
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
    limitedXml = new XMLSerializer().serializeToString(doc);
  } catch { }
  return { xml: limitedXml, originalCount };
}
