// Automatically load .env environment variables
import dotenv from 'dotenv';
dotenv.config();
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Agent } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';

// Function to get package info from package.json
export function getPackageInfo(): { name: string; version: string } {
    try {
        const packagePath = join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { name?: string; version?: string };
        return {
            name: packageJson.name || 'mcp-abap-adt',
            version: packageJson.version || '0.0.0'
        };
    } catch (error) {
        console.warn('Failed to read package.json, using defaults:', error);
        return {
            name: 'mcp-abap-adt',
            version: '0.0.0'
        };
    }
}

// Define and export SAP Config type and getConfig function directly in utils.ts
export type SapConfig = {
    url: string;
    username: string;
    password: string;
    client: string;
    language?: string;
};

// Common SAP authentication parameters interface for all handlers
export interface SapAuthParams {
    _sapUsername?: string;
    _sapPassword?: string;
    _sapClient?: string;
    _sapLanguage?: string;
}

// Helper function to get base URL using SapAuthParams
export async function getBaseUrlFromAuth(auth: SapAuthParams): Promise<string> {
    return getBaseUrl(auth._sapUsername, auth._sapPassword, auth._sapClient, auth._sapLanguage);
}

// Helper function for making ADT requests using SapAuthParams  
export async function makeAdtRequestWithAuth(
    url: string,
    method: string = 'GET',
    timeout: number = 30000,
    data?: any,
    headers?: any,
    responseType?: 'text' | 'json',
    auth?: SapAuthParams
): Promise<any> {
    return makeAdtRequest(
        url, 
        method, 
        timeout, 
        data, 
        headers, 
        responseType,
        auth?._sapUsername,
        auth?._sapPassword, 
        auth?._sapClient,
        auth?._sapLanguage
    );
}

// Example function to get SAP connection information from headers or environment variables as fallback
export function getConfig(sapUsername?: string, sapPassword?: string, sapClient?: string, sapLanguage?: string): SapConfig {
    // URL is now set dynamically via X-SAP_URL header in remoteServer.ts
    const url = process.env.SAP_URL;
    const username = sapUsername || process.env.SAP_USERNAME;
    const password = sapPassword || process.env.SAP_PASSWORD;
    const client = sapClient || process.env.SAP_CLIENT;
    const language = sapLanguage || process.env.SAP_LANGUAGE || 'EN';
    
    if (!url) {
        throw new Error('SAP_URL must be provided via X-SAP_URL header from MCP client.');
    }
    if (!username || !password || !client) {
        throw new Error('SAP connection parameters (USERNAME, PASSWORD, CLIENT) must be provided via headers or environment variables.');
    }
    return { url, username, password, client, language };
}
import convert from 'xml-js';

export { McpError, ErrorCode };
export type { AxiosResponse };

function removeNamespace(key: string) {
    return key.replace(/^[^:]+:/, '');
}

function simplifyXmlJson(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(simplifyXmlJson);
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === '_attributes') {
            for (const [attrKey, attrValue] of Object.entries(value as any)) {
                result[removeNamespace(attrKey)] = attrValue;
            }
        } else if (key === '_text') {
            return value;
        } else if (typeof value === 'object' && value !== null) {
            const simplified = simplifyXmlJson(value);
            if (simplified !== null && simplified !== undefined) {
                result[removeNamespace(key)] = simplified;
            }
        } else {
            result[removeNamespace(key)] = value;
        }
    }
    return result;
}

export function convertXmlToJson(xmlString: string): string {
    try {
        // Clean up the XML string - remove any leading/trailing whitespace and check for valid XML
        const cleanXml = xmlString.trim();
        
        // Check if it's actually XML
        if (!cleanXml.startsWith('<?xml') && !cleanXml.startsWith('<')) {
            console.warn('Input does not appear to be valid XML, returning as-is');
            return cleanXml;
        }
        
        // Find the end of the XML declaration and the start of the root element
        const xmlDeclMatch = cleanXml.match(/^<\?xml[^>]*\?>\s*/);
        let xmlContent = cleanXml;
        
        if (xmlDeclMatch) {
            const afterDeclaration = cleanXml.substring(xmlDeclMatch[0].length);
            // Check if there's a valid root element after the declaration
            if (afterDeclaration.trim().startsWith('<')) {
                xmlContent = cleanXml;
            } else {
                console.warn('No valid root element found after XML declaration');
                return cleanXml;
            }
        }
        
    // NOTE: Do not remove or modify <atom:id> prefixes — keep original ADT dump IDs intact
    const jsonData = convert.xml2js(xmlContent, {
            compact: true,
            ignoreAttributes: false
        });
        const simplifiedData = simplifyXmlJson(jsonData);
        return JSON.stringify(simplifiedData, null, 2);
    } catch (error: any) {
        console.warn('XML to JSON conversion failed, returning original content:', error?.message || 'Unknown error');
        return xmlString;
    }
}

export function return_response(response: AxiosResponse) {
    let responseData = response.data;
    let content;
    function ensureString(val: any) {
        return typeof val === 'string' ? val : JSON.stringify(val);
    }
    if (typeof responseData === 'string') {
        const xmlStart = responseData.indexOf('<?xml');
        if (xmlStart !== -1) {
            const xmlString = responseData.substring(xmlStart);
            const prefix = responseData.substring(0, xmlStart).trim();
            const jsonString = convertXmlToJson(xmlString);
            content = [
                ...(prefix ? [{ type: 'text', text: ensureString(prefix) }] : []),
                { type: 'text', text: ensureString(jsonString) }
            ];
        } else if (responseData.trim().startsWith('<?xml')) {
            responseData = convertXmlToJson(responseData);
            content = [{ type: 'text', text: ensureString(responseData) }];
        } else {
            content = [{ type: 'text', text: ensureString(responseData) }];
        }
    } else {
        content = [{ type: 'text', text: ensureString(responseData) }];
    }
    // Normalize content to always be an array for downstream/tool consumers
    if (!Array.isArray(content)) {
        content = (content !== undefined && content !== null) ? [content] : [];
    }
    return { isError: false, content };
}

export function return_error(error: any) {
    let errorMessage = 'Unknown error';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof McpError) {
        errorMessage = error.message;
        errorCode = String(error.code);
    } else if (error instanceof AxiosError) {
        if (error.response?.data) {
            errorMessage = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else if (error.message) {
            errorMessage = `HTTP Error: ${error.message}`;
        } else {
            errorMessage = `HTTP Error: ${error.code || 'Unknown'}`;
        }
        errorCode = 'HTTP_ERROR';
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = 'GENERIC_ERROR';
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
    } else {
        errorMessage = String(error);
    }
    
    return {
        isError: true,
        error: {
            code: errorCode,
            message: errorMessage
        },
        content: [{
            type: 'text',
            text: `Error: ${errorMessage}`
        }]
    };
}

let axiosInstance: AxiosInstance | null = null;
export function createAxiosInstance() {
    if (!axiosInstance) {
        axiosInstance = axios.create({
            httpsAgent: new Agent({
                rejectUnauthorized: false // Allow self-signed certificates
            })
        });
    }
    return axiosInstance;
}

// (removed) cleanup() used only previously for tests — not referenced elsewhere in the project

let config: SapConfig | undefined;
let csrfToken: string | null = null;
let cookies: string | null = null; // Variable to store cookies

export async function getBaseUrl(sapUsername?: string, sapPassword?: string, sapClient?: string, sapLanguage?: string) {
    let currentConfig: SapConfig;
    
    if (sapUsername && sapPassword && sapClient) {
        currentConfig = getConfig(sapUsername, sapPassword, sapClient, sapLanguage);
    } else {
        if (!config) {
            config = getConfig();
        }
        currentConfig = config;
    }
    
    const { url } = currentConfig;
    if (!/^https?:\/\/.+/.test(url)) {
        throw new Error(`SAP_URL environment variable is not a valid URL format: ${url}`);
    }
    try {
        const urlObj = new URL(url);
        const baseUrl = urlObj.origin;
        return baseUrl;
    } catch (error) {
        const errorMessage = `Invalid URL in configuration: ${error instanceof Error ? error.message : error}`;
        throw new Error(errorMessage);
    }
}

export async function getAuthHeaders(sapUsername?: string, sapPassword?: string, sapClient?: string, sapLanguage?: string) {
    let currentConfig: SapConfig;
    
    if (sapUsername && sapPassword && sapClient) {
    // Use authentication information provided by the client
        currentConfig = getConfig(sapUsername, sapPassword, sapClient, sapLanguage);
    } else {
    // Use default configuration
        if (!config) {
            config = getConfig();
        }
        currentConfig = config;
    }
    
    const { username, password, client, language } = currentConfig;
    const auth = Buffer.from(`${username}:${password}`).toString('base64'); // Create Basic Auth string
    const headers: Record<string, string> = {
        'Authorization': `Basic ${auth}`,
        'X-SAP-Client': client
    };
    
    if (language) {
        headers['Accept-Language'] = language;
    }
    
    return headers;
}

async function fetchCsrfToken(url: string, sapUsername?: string, sapPassword?: string, sapClient?: string, sapLanguage?: string): Promise<string> {
    try {
        const response = await createAxiosInstance()({
            method: 'GET',
            url,
            headers: {
                ...(await getAuthHeaders(sapUsername, sapPassword, sapClient, sapLanguage)),
                'x-csrf-token': 'fetch'
            }
        });
        const token = response.headers['x-csrf-token'];
        if (!token) {
            throw new Error('No CSRF token in response headers');
        }
        if (response.headers['set-cookie']) {
            cookies = response.headers['set-cookie'].join('; ');
        }
        return token;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.headers['x-csrf-token']) {
            const token = error.response.headers['x-csrf-token'];
            if (token) {
                if (error.response.headers['set-cookie']) {
                    cookies = error.response.headers['set-cookie'].join('; ');
                }
                return token;
            }
        }
        throw new Error(`Failed to fetch CSRF token: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function makeAdtRequest(
    url: string,
    method: string,
    timeout: number,
    data?: any,
    customHeaders?: Record<string, string>,
    responseType: 'text' | 'json' = 'json',
    sapUsername?: string,
    sapPassword?: string,
    sapClient?: string,
    sapLanguage?: string
) {
    if ((method === 'POST' || method === 'PUT') && !csrfToken) {
        try {
            csrfToken = await fetchCsrfToken(url, sapUsername, sapPassword, sapClient, sapLanguage);
        } catch (error) {
            throw new Error('CSRF token is required for POST/PUT requests but could not be fetched');
        }
    }
    const requestHeaders = {
        ...(await getAuthHeaders(sapUsername, sapPassword, sapClient, sapLanguage)),
        ...(customHeaders || {})
    };
    if ((method === 'POST' || method === 'PUT') && csrfToken) {
        requestHeaders['x-csrf-token'] = csrfToken;
    }
    if (cookies) {
        requestHeaders['Cookie'] = cookies;
    }
    // Adjust axios settings to handle cases where the URL is already percent-encoded
    const config: AxiosRequestConfig = {
        method,
        url,
        headers: requestHeaders,
        timeout,
        responseType,
        // Prevent additional encoding if the URL is already encoded
        validateStatus: function (status) {
            return status < 500; // Do not reject status codes below 500
        },
        // Use transformRequest to bypass axios's internal URL parsing
        transformRequest: [(data, headers) => {
                // The URL is already properly encoded; use as-is
            return data;
        }]
    };
    if (data) {
        config.data = data;
    }
    try {
        const response = await createAxiosInstance()(config);
        return response;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 403 &&
            error.response.data?.includes('CSRF')) {
            csrfToken = await fetchCsrfToken(url, sapUsername, sapPassword, sapClient);
            const retryConfig: AxiosRequestConfig = {
                method,
                url,
                headers: { ...requestHeaders, 'x-csrf-token': csrfToken },
                timeout,
                ...(data && { data }),
                responseType
            };
            return await createAxiosInstance()(retryConfig);
        }
        if (error instanceof AxiosError) {
            console.error(`ADT Request failed for ${method} ${url}:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
        } else {
            console.error(`ADT Request failed for ${method} ${url}:`, error);
        }
        throw error;
    }
}