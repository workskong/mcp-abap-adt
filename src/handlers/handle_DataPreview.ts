import { McpError, ErrorCode, makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface DataPreview {
  ddicEntityName: string;
  rowNumber?: number;
}

export async function handle_DataPreview(args: DataPreview) {
  try {
    if (!args?.ddicEntityName) {
      throw new McpError(ErrorCode.InvalidParams, 'ddicEntityName is required');
    }
    const rowNumber = args.rowNumber ?? 100;
    const url = `${await getBaseUrl()}/sap/bc/adt/datapreview/ddic?rowNumber=${rowNumber}&ddicEntityName=${args.ddicEntityName}`;
    
    const response = await makeAdtRequest(url, 'POST', 30000, );
    return return_response({ data: response.data } as any);
  } catch (error) {
    return return_error(error);
  }
}
