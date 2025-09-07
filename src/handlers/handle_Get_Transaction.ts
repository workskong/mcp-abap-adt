import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetTransactionArgs extends SapAuthParams {
  transaction_name: string;
}

export async function handleGetTransaction(args: GetTransactionArgs) {
  try {
    if (!args?.transaction_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Transaction name is required');
    }

    const encodedTransactionName = encodeURIComponent(args.transaction_name);
    const baseUrl = await getBaseUrlFromAuth(args);
    const url = `${baseUrl}/sap/bc/adt/repository/informationsystem/objectproperties/values?uri=%2Fsap%2Fbc%2Fadt%2Fvit%2Fwb%2Fobject_type%2Ftrant%2Fobject_name%2F${encodedTransactionName}&facet=package&facet=appl`;
    const response = await makeAdtRequestWithAuth(url, 'GET', 30000, undefined, undefined, 'json', args);

    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
