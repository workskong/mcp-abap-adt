import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';
import { DOMParser, XMLSerializer } from 'xmldom';
import { AxiosResponse } from 'axios';

interface ABAPTraces extends SapAuthParams {
  user?: string;
  maxResults?: number;
  objectNameFilter?: string;
}

export async function Get_ABAPTraces(args: ABAPTraces) {
  try {
    if (typeof args.user !== 'string' || args.user.trim() === '') {
      throw new McpError(ErrorCode.InvalidParams, 'User is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const user = args.user.trim().toUpperCase();
    const maxResults = args.maxResults ?? 5;
    let trimmedNotice = '';
    let limitedMax = maxResults;
    if (maxResults > 5) {
      trimmedNotice = 'Requested maxResults exceeded 5; only 5 items will be returned and the rest are discarded.';
      limitedMax = 5;
    }

    const url = `${baseUrl}/sap/bc/adt/runtime/traces/abaptraces?user=${user}`;
    const adtRes = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'text', args);
    let xml = adtRes.data;

    const limited = limitAtomEntries(xml, limitedMax, args.objectNameFilter);
    xml = limited.xml;
    const totalCount = limited.totalCount;
    const displayCount = limited.displayCount ?? limited.totalCount;

    const mcpInfoTag = `\n<atom:mcp_info>\n  <atom:timeUnit>us</atom:timeUnit>\n  <atom:sizeUnit>byte</atom:sizeUnit>\n  <atom:totalCount>${totalCount}</atom:totalCount>\n  <atom:displayCount>${displayCount}</atom:displayCount>\n</atom:mcp_info>\n`;
    const xmlWithInfo = xml.replace(/(<\?xml[^>]*>\s*)?/, (m) => m + mcpInfoTag);

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
  const filterUpper = typeof objectNameFilter === 'string' ? objectNameFilter.trim().toUpperCase() : undefined;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    let entries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry');

    if (filterUpper) {
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        let match = false;
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
        if (!match) {
          entry.parentNode?.removeChild(entry);
        }
      }
    }
    totalCount = entries.length;

    if (entries.length > maxCount) {
      for (let i = entries.length - 1; i >= maxCount; i--) {
        const entry = entries[i];
        entry.parentNode?.removeChild(entry);
      }
    }
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const links = entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'link');
      for (let j = links.length - 1; j >= 0; j--) {
        links[j].parentNode?.removeChild(links[j]);
      }
    }
    displayCount = entries.length;

    limitedXml = new XMLSerializer().serializeToString(doc);
  } catch { }
  return { xml: limitedXml, totalCount, displayCount };
}