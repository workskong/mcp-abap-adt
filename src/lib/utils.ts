// .env 환경변수 자동 로드
import dotenv from 'dotenv';
dotenv.config();
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Agent } from 'https';
import { AxiosResponse } from 'axios';
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
        const jsonData = convert.xml2js(xmlString, {
            compact: true,
            ignoreAttributes: false
        });
        const simplifiedData = simplifyXmlJson(jsonData);
        return JSON.stringify(simplifiedData, null, 2);
    } catch (error: any) {
        console.error('XML to JSON conversion failed:', error?.message || 'Unknown error');
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
    return { isError: false, content };
}

export function return_error(error: any) {
    let errorMessage = 'Unknown error';
    if (error instanceof AxiosError) {
        if (error.response?.data) {
            errorMessage = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else if (error.message) {
            errorMessage = `HTTP Error: ${error.message}`;
        } else {
            errorMessage = `HTTP Error: ${error.code || 'Unknown'}`;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        errorMessage = String(error);
    }
    return {
        isError: true,
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

// Cleanup function for tests
export function cleanup() {
    axiosInstance = null;
    config = undefined;
    csrfToken = null;
    cookies = null;
}

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
    params?: any,
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
        ...(await getAuthHeaders())
    };
    if ((method === 'POST' || method === 'PUT') && csrfToken) {
        requestHeaders['x-csrf-token'] = csrfToken;
    }
    if (cookies) {
        requestHeaders['Cookie'] = cookies;
    }
    const config: AxiosRequestConfig = {
        method,
        url,
        headers: requestHeaders,
        timeout,
        params: params,
        responseType
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
                params: params,
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