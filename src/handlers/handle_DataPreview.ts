import { McpError, ErrorCode, makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface DataPreview {
  ddicEntityName: string;
  rowNumber?: number;
  _sapUsername?: string;
  _sapPassword?: string;
  _sapClient?: string;
  _sapLanguage?: string;
}

export async function handle_DataPreview(args: DataPreview) {
  try {
    if (!args?.ddicEntityName) {
      throw new McpError(ErrorCode.InvalidParams, 'ddicEntityName is required');
    }

    const baseUrl = await getBaseUrl(args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    const rowNumber = args.rowNumber ?? 100;
    const url = `${baseUrl}/sap/bc/adt/datapreview/ddic?rowNumber=${rowNumber}&ddicEntityName=${args.ddicEntityName}`;
    
    const response = await makeAdtRequest(url, 'POST', 30000, undefined, undefined, 'json', args._sapUsername, args._sapPassword, args._sapClient, args._sapLanguage);
    return return_response({ data: response.data } as any);
  } catch (error) {
    return return_error(error);
  }
}
