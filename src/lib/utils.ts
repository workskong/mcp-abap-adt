// .env 환경변수 자동 로드
import dotenv from 'dotenv';
dotenv.config();
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Agent } from 'https';
// SAP Config 타입 및 getConfig 함수 utils.ts에서 직접 정의 및 export
export type SapConfig = {
    url: string;
    username: string;
    password: string;
    client: string;
};

// 환경변수 또는 별도 설정 파일에서 SAP 접속 정보를 가져오는 함수 예시
export function getConfig(): SapConfig {
    const url = process.env.SAP_URL;
    const username = process.env.SAP_USERNAME;
    const password = process.env.SAP_PASSWORD;
    const client = process.env.SAP_CLIENT;
    if (!url || !username || !password || !client) {
        throw new Error('SAP 환경변수(SAP_URL, SAP_USERNAME, SAP_PASSWORD, SAP_CLIENT)가 모두 설정되어야 합니다.');
    }
    return { url, username, password, client };
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

export async function getBaseUrl() {
    if (!config) {
        config = getConfig();
    }
    const { url } = config;
    if (!/^https?:\/\/.+/.test(url)) {
        throw new Error(`SAP_URL 환경변수가 올바른 URL 형식이 아닙니다: ${url}`);
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

export async function getAuthHeaders() {
    if (!config) {
        config = getConfig();
    }
    const { username, password, client } = config;
    const auth = Buffer.from(`${username}:${password}`).toString('base64'); // Create Basic Auth string
    return {
        'Authorization': `Basic ${auth}`,
        'X-SAP-Client': client
    };
}

async function fetchCsrfToken(url: string): Promise<string> {
    try {
        const response = await createAxiosInstance()({
            method: 'GET',
            url,
            headers: {
                ...(await getAuthHeaders()),
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
    responseType: 'text' | 'json' = 'json'
) {
    if ((method === 'POST' || method === 'PUT') && !csrfToken) {
        try {
            csrfToken = await fetchCsrfToken(url);
        } catch (error) {
            throw new Error('CSRF token is required for POST/PUT requests but could not be fetched');
        }
    }
    const requestHeaders = {
        ...(await getAuthHeaders()),
        ...(customHeaders || {})
    };
    if ((method === 'POST' || method === 'PUT') && csrfToken) {
        requestHeaders['x-csrf-token'] = csrfToken;
    }
    if (cookies) {
        requestHeaders['Cookie'] = cookies;
    }
    // URL이 이미 퍼센트 인코딩된 경우를 처리하기 위해 axios 설정 조정
    const config: AxiosRequestConfig = {
        method,
        url,
        headers: requestHeaders,
        timeout,
        responseType,
        // URL이 이미 인코딩되어 있는 경우 추가 인코딩을 방지
        validateStatus: function (status) {
            return status < 500; // 500 이하는 reject하지 않음
        },
        // axios의 내부 URL 파싱을 우회하기 위해 transformRequest 사용
        transformRequest: [(data, headers) => {
            // URL이 이미 올바르게 인코딩되어 있으므로 그대로 사용
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
            csrfToken = await fetchCsrfToken(url);
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