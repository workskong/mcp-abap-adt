import { McpError, ErrorCode } from '../lib/utils';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils';

interface GetPackageArgs {
  package_name: string;
}

export async function handleGetPackage(args: GetPackageArgs) {
  try {
    if (!args?.package_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Package name is required');
    }

    const nodeContentsUrl = `${await getBaseUrl()}/sap/bc/adt/repository/nodestructure`;
    const nodeContentsParams = {
      parent_type: "DEVC/K",
      parent_name: args.package_name,
      withShortDescriptions: true
    };

    const package_structure_response = await makeAdtRequest(nodeContentsUrl, 'POST', 30000, nodeContentsParams);
    return return_response({ data: package_structure_response.data } as any);

  } catch (error) {
    return return_error(error);
  }
}
