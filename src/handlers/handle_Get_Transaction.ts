import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

interface GetTransactionArgs {
  transaction_name: string;
}

export async function handleGetTransaction(args: GetTransactionArgs) {
  try {
    if (!args?.transaction_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Transaction name is required');
    }
    
    const encodedTransactionName = encodeURIComponent(args.transaction_name);
    const url = `${await getBaseUrl()}/sap/bc/adt/repository/informationsystem/objectproperties/values?uri=%2Fsap%2Fbc%2Fadt%2Fvit%2Fwb%2Fobject_type%2Ftrant%2Fobject_name%2F${encodedTransactionName}&facet=package&facet=appl`;
    const response = await makeAdtRequest(url, 'GET', 30000);
    
    return return_response(response);
  } catch (error) {
    return return_error(error);
  }
}
