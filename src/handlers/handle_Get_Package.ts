import { McpError, ErrorCode, SapAuthParams } from '../lib/utils';
import { getBaseUrlFromAuth, makeAdtRequestWithAuth, return_error, return_response } from '../lib/utils';

interface GetPackageArgs extends SapAuthParams {
  package_name: string;
}

export async function handleGetPackage(args: GetPackageArgs) {
  try {
    if (!args?.package_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Package name is required');
    }

    const baseUrl = await getBaseUrlFromAuth(args);
    const nodeContentsUrl = `${baseUrl}/sap/bc/adt/repository/nodestructure`;
    const nodeContentsParams = {
      parent_type: "DEVC/K",
      parent_name: args.package_name,
      withShortDescriptions: true
    };

    const package_structure_response = await makeAdtRequestWithAuth(nodeContentsUrl, 'POST', 30000, nodeContentsParams, undefined, 'json', args);
    return return_response({ data: package_structure_response.data } as any);

  } catch (error) {
    return return_error(error);
  }
}
