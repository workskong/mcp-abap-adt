import { McpError, ErrorCode, getBaseUrlFromAuth, makeAdtRequestWithAuth, SapAuthParams, return_error, return_response } from '../lib/utils';

interface DataPreview extends SapAuthParams {
  ddicEntityName: string;
  rowNumber?: number;
}

export async function handle_DataPreview(args: DataPreview) {
  try {
    if (!args?.ddicEntityName) {
      throw new McpError(ErrorCode.InvalidParams, 'ddicEntityName is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const rowNumber = args.rowNumber ?? 100;
    const url = `${baseUrl}/sap/bc/adt/datapreview/ddic?rowNumber=${rowNumber}&ddicEntityName=${args.ddicEntityName}`;
    
    const response = await makeAdtRequestWithAuth(url, 'POST', 30000, undefined, undefined, 'json', args);
    return return_response({ data: response.data } as any);
  } catch (error) {
    return return_error(error);
  }
}
