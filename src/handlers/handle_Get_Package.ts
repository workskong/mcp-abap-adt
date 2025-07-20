import { McpError, ErrorCode, convertXmlToJson } from '../lib/utils.js';
import { makeAdtRequest, return_error, return_response, getBaseUrl } from '../lib/utils.js';

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

    // XML → JSON 변환 및 단순화 (utils 함수 활용)
    const jsonString = convertXmlToJson(package_structure_response.data);

    // 일관된 포맷으로 반환
    return return_response({ data: jsonString } as any);

  } catch (error) {
    return return_error(error);
  }
}
