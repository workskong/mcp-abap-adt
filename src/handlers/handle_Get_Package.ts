import { McpError, ErrorCode } from '../lib/utils.js';
import { makeAdtRequest, return_error, getBaseUrl } from '../lib/utils.js';
import convert from 'xml-js';

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
    const result = convert.xml2js(package_structure_response.data, { compact: true });

    const nodes = result["asx:abap"]?.["asx:values"]?.DATA?.TREE_CONTENT?.SEU_ADT_REPOSITORY_OBJ_NODE || [];
    const extractedData = (Array.isArray(nodes) ? nodes : [nodes]).filter(node =>
      node.OBJECT_NAME?._text && node.OBJECT_URI?._text
    ).map(node => ({
      OBJECT_TYPE: node.OBJECT_TYPE._text,
      OBJECT_NAME: node.OBJECT_NAME._text,
      OBJECT_DESCRIPTION: node.DESCRIPTION?._text,
      OBJECT_URI: node.OBJECT_URI._text
    }));

    return {
      content: extractedData
    };

  } catch (error) {
    return return_error(error);
  }
}
